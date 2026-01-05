/**
 * Exercise Builder
 *
 * Utilities per costruire esercizi workout da varie fonti
 *
 * NOMENCLATURA:
 * - catalogExerciseId: ID dell'esercizio nel catalogo database (unico standard)
 * - id: ID temporaneo dell'istanza dell'esercizio nel workout
 */
import type { Exercise } from '@onecoach/types';
import type { LocalizedExercise } from '@onecoach/lib-exercise';
/**
 * Costruisce un Exercise da un LocalizedExercise del catalogo
 */
export declare function buildWorkoutExerciseFromCatalog(exercise: LocalizedExercise): Exercise;
//# sourceMappingURL=exercise-builder.d.ts.map