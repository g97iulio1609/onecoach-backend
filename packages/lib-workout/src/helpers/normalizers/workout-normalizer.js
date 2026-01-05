/**
 * Workout Normalizer
 *
 * Funzioni per normalizzare dati workout programs da formati vari
 */
import { DifficultyLevel, WorkoutStatus } from '@onecoach/types/client';
import { ensureArray, ensureArrayOfStrings, ensureNumber, ensureString, parseJsonIfString, } from '../utils/type-helpers';
import { normalizeExercise } from './exercise-normalizer';
/**
 * Normalizza il livello di difficoltà
 */
export function normalizeDifficulty(value) {
    if (typeof value === 'string') {
        const normalized = value.trim().toUpperCase();
        if (normalized in DifficultyLevel) {
            return DifficultyLevel[normalized];
        }
    }
    return DifficultyLevel.BEGINNER;
}
/**
 * Normalizza lo status del workout
 */
export function normalizeStatus(value) {
    if (typeof value === 'string') {
        const normalized = value.trim().toUpperCase();
        if (normalized in WorkoutStatus) {
            return WorkoutStatus[normalized];
        }
    }
    return WorkoutStatus.DRAFT;
}
/**
 * Normalizza un giorno di allenamento
 */
export function normalizeDay(rawDay, index) {
    const raw = rawDay && typeof rawDay === 'object' ? rawDay : {};
    const dayNumber = ensureNumber(raw.dayNumber, index + 1);
    const exercises = ensureArray(raw.exercises).map((exercise, exerciseIndex) => normalizeExercise(exercise, dayNumber, exerciseIndex));
    return {
        dayNumber,
        // Use 'name' directly (aligned with schema), with fallback to dayName for backward compatibility
        name: ensureString(raw.name ?? raw.dayName ?? `Giorno ${dayNumber}`),
        notes: ensureString(raw.notes ?? ''),
        // Use 'totalDuration' directly (aligned with schema), with estimatedDurationMinutes as AI alias
        totalDuration: raw.totalDuration !== undefined
            ? ensureNumber(raw.totalDuration)
            : raw.estimatedDurationMinutes !== undefined
                ? ensureNumber(raw.estimatedDurationMinutes)
                : undefined,
        exercises,
        targetMuscles: (() => {
            // Se targetMuscles è esplicitamente fornito, usalo (può essere array di IDs o nomi)
            const explicit = ensureArrayOfStrings(raw.targetMuscles ?? raw.focus).filter(Boolean);
            if (explicit.length > 0) {
                // Se sono già IDs (CUIDs), mantenerli; altrimenti saranno convertiti altrove
                return Array.from(new Set(explicit));
            }
            // Fallback: estrai muscoli dagli esercizi (convertendo in ID se necessario)
            // Nota: questo è un fallback e potrebbe non funzionare perfettamente senza async conversion
            // In futuro, questa logica potrebbe essere spostata in un passaggio post-normalizzazione
            return [];
        })(),
        warmup: raw.warmup ? ensureString(raw.warmup) : undefined,
        cooldown: ensureString(raw.cooldown ?? ''),
    };
}
/**
 * Normalizza una settimana di allenamento
 */
export function normalizeWeek(rawWeek, index) {
    const raw = rawWeek && typeof rawWeek === 'object' ? rawWeek : {};
    const weekNumber = ensureNumber(raw.weekNumber, index + 1);
    const daysSource = Array.isArray(raw.days) && raw.days.length > 0
        ? raw.days
        : Array.isArray(raw.workouts) && raw.workouts.length > 0
            ? raw.workouts // Support 'workouts' as fallback for backward compatibility
            : raw.sessions && Array.isArray(raw.sessions)
                ? raw.sessions
                : [];
    const days = daysSource.map((day, dayIndex) => normalizeDay(day, dayIndex));
    return {
        weekNumber,
        notes: raw.notes ? ensureString(raw.notes) : undefined,
        focus: raw.focus ? ensureString(raw.focus) : raw.theme ? ensureString(raw.theme) : undefined,
        days: days.length > 0
            ? days
            : [
                {
                    dayNumber: 1,
                    name: `Giorno 1`,
                    exercises: [],
                    notes: '',
                    totalDuration: undefined,
                    targetMuscles: [],
                    warmup: undefined,
                    cooldown: '',
                },
            ],
    };
}
/**
 * Parse le settimane da un valore sconosciuto
 */
export function parseWeeks(value) {
    if (Array.isArray(value)) {
        return value;
    }
    const parsed = parseJsonIfString(value);
    if (Array.isArray(parsed)) {
        return parsed;
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.weeks)) {
        return parsed.weeks;
    }
    return [];
}
/**
 * Normalizza metadata
 */
export function normalizeMetadata(value) {
    const parsed = parseJsonIfString(value);
    if (parsed) {
        return parsed;
    }
    if (value && typeof value === 'object') {
        return value;
    }
    return null;
}
/**
 * Normalizza un workout program completo da Prisma
 */
export function normalizeWorkoutProgram(program) {
    const weeks = parseWeeks(program.weeks).map((week, index) => normalizeWeek(week, index));
    const normalizedWeeks = weeks.length > 0
        ? weeks
        : [
            {
                weekNumber: 1,
                notes: '',
                days: [
                    {
                        dayNumber: 1,
                        name: `Giorno 1`,
                        exercises: [],
                        notes: '',
                        totalDuration: undefined,
                        targetMuscles: [],
                        warmup: undefined,
                        cooldown: '',
                    },
                ],
                focus: '',
            },
        ];
    const createdAtDate = program.createdAt instanceof Date
        ? program.createdAt
        : new Date(program.createdAt);
    const updatedAtDate = 'updatedAt' in program && program.updatedAt
        ? program.updatedAt instanceof Date
            ? program.updatedAt
            : new Date(program.updatedAt)
        : createdAtDate;
    return {
        id: program.id,
        name: program.name,
        description: ensureString(program.description),
        difficulty: normalizeDifficulty(program.difficulty),
        durationWeeks: Math.max(1, ensureNumber(program.durationWeeks, normalizedWeeks.length || 1)),
        weeks: normalizedWeeks,
        goals: ensureArrayOfStrings(program.goals),
        status: normalizeStatus(program.status),
        userId: 'userId' in program ? (program.userId ?? undefined) : undefined,
        metadata: normalizeMetadata(program.metadata),
        createdAt: createdAtDate.toISOString(),
        updatedAt: updatedAtDate.toISOString(),
        version: 'version' in program ? (program.version ?? 1) : undefined,
    };
}
