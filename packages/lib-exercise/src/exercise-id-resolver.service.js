/**
 * Exercise ID Resolver Service
 *
 * Resolves exercise IDs to localized names in batch.
 * Used when AI provides exerciseId references that need to be
 * displayed with localized names in the frontend.
 */
import { prisma } from '@onecoach/lib-core/prisma';
import { SimpleCache } from '@onecoach/lib-shared';
const DEFAULT_LOCALE = 'en';
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
// Cache for resolved exercises
const exerciseCache = new SimpleCache({
    max: 200,
    ttl: CACHE_TTL_MS,
});
/**
 * Build cache key from exercise IDs and locale
 */
function buildCacheKey(ids, locale) {
    return `exercises:${locale}:${ids.sort().join(',')}`;
}
/**
 * Resolve exercise IDs to names in batch
 * @param ids Array of exercise IDs
 * @param locale Target locale for localization
 * @returns Record mapping exercise ID → { id, name, localizedName, slug }
 */
export async function resolveExerciseIds(ids, locale = DEFAULT_LOCALE) {
    if (ids.length === 0)
        return {};
    const cacheKey = buildCacheKey(ids, locale);
    const cached = exerciseCache.get(cacheKey);
    if (cached)
        return cached;
    const exercises = await prisma.exercises.findMany({
        where: { id: { in: ids } },
        select: {
            id: true,
            slug: true,
            exercise_translations: {
                where: {
                    OR: [{ locale }, { locale: DEFAULT_LOCALE }],
                },
                select: {
                    locale: true,
                    name: true,
                },
            },
        },
    });
    const result = {};
    for (const exercise of exercises) {
        const translation = exercise.exercise_translations.find((t) => t.locale === locale) ||
            exercise.exercise_translations.find((t) => t.locale === DEFAULT_LOCALE) ||
            null;
        // Get English name from default locale translation
        const englishTranslation = exercise.exercise_translations.find((t) => t.locale === DEFAULT_LOCALE);
        result[exercise.id] = {
            id: exercise.id,
            name: englishTranslation?.name || exercise.slug, // Fallback to slug if no translation
            localizedName: translation?.name || englishTranslation?.name || exercise.slug,
            slug: exercise.slug,
        };
    }
    exerciseCache.set(cacheKey, result);
    return result;
}
/**
 * Resolve a single exercise ID to name
 * @param exerciseId Exercise ID
 * @param locale Target locale
 * @returns Exercise name or null if not found
 */
export async function resolveExerciseName(exerciseId, locale = DEFAULT_LOCALE) {
    const resolved = await resolveExerciseIds([exerciseId], locale);
    return resolved[exerciseId]?.localizedName || null;
}
/**
 * Build a map of exercise ID → English name for AI consumption
 * @param ids Array of exercise IDs
 * @returns Record mapping ID → English name
 */
export async function buildExerciseIdMapForAI(ids) {
    const resolved = await resolveExerciseIds(ids, DEFAULT_LOCALE);
    const result = {};
    for (const [id, info] of Object.entries(resolved)) {
        result[id] = info.name; // Use English name for AI
    }
    return result;
}
