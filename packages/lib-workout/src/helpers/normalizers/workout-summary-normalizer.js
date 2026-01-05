/**
 * Workout Summary Normalizer
 *
 * Normalizer leggero per le liste di programmi.
 * NON parsa il campo `weeks` JSON per evitare overhead.
 */
import { DifficultyLevel, WorkoutStatus } from '@onecoach/types/client';
import { normalizeDifficulty, normalizeStatus } from './workout-normalizer';
import { ensureArrayOfStrings, ensureNumber, ensureString } from '../utils/type-helpers';
/**
 * Normalizza un programma per la visualizzazione in lista.
 * NON effettua parsing del campo weeks per performance ottimale.
 */
export function normalizeWorkoutProgramSummary(program) {
    const createdAtDate = program.createdAt instanceof Date
        ? program.createdAt
        : new Date(program.createdAt);
    const updatedAtDate = program.updatedAt instanceof Date
        ? program.updatedAt
        : new Date(program.updatedAt);
    return {
        id: program.id,
        name: ensureString(program.name),
        description: ensureString(program.description),
        difficulty: normalizeDifficulty(program.difficulty),
        durationWeeks: Math.max(1, ensureNumber(program.durationWeeks, 1)),
        goals: ensureArrayOfStrings(program.goals),
        status: normalizeStatus(program.status),
        createdAt: createdAtDate.toISOString(),
        updatedAt: updatedAtDate.toISOString(),
        userId: program.userId ?? undefined,
    };
}
