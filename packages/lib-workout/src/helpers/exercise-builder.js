/**
 * Exercise Builder
 *
 * Utilities per costruire esercizi workout da varie fonti
 *
 * NOMENCLATURA:
 * - catalogExerciseId: ID dell'esercizio nel catalogo database (unico standard)
 * - id: ID temporaneo dell'istanza dell'esercizio nel workout
 */
import { createId } from '@onecoach/lib-shared/utils/id-generator';
import { getMuscleGroupFromName } from './utils/muscle-group';
import { DEFAULT_SET } from './constants';
/**
 * Costruisce un Exercise da un LocalizedExercise del catalogo
 */
export function buildWorkoutExerciseFromCatalog(exercise) {
    const muscleGroups = Array.from(new Set(exercise.muscles
        .map((muscle) => getMuscleGroupFromName(muscle.name))
        .filter((group) => group !== null)));
    const fallbackGroup = exercise.bodyParts
        .map((bodyPart) => getMuscleGroupFromName(bodyPart.name))
        .find((group) => group !== null) ?? 'full-body';
    // Crea un setGroup di default
    const defaultSetGroup = {
        id: createId('setgroup'),
        count: 3,
        baseSet: { ...DEFAULT_SET },
        sets: [{ ...DEFAULT_SET }, { ...DEFAULT_SET }, { ...DEFAULT_SET }],
    };
    return {
        id: createId('exercise_catalog'),
        name: exercise.translation?.name ?? exercise.slug,
        description: exercise.translation?.description ?? exercise.overview ?? '',
        category: 'strength',
        muscleGroups: muscleGroups.length > 0 ? muscleGroups : [fallbackGroup],
        setGroups: [defaultSetGroup],
        notes: exercise.overview ?? '',
        typeLabel: exercise.exerciseTypeName ?? 'strength',
        repRange: '8-12',
        formCues: exercise.exerciseTips ?? [],
        equipment: exercise.equipments.map((equipment) => equipment.name),
        catalogExerciseId: exercise.id, // ID catalogo per lookup 1RM
        variation: {}, // Variante multilingue (vuota di default)
    };
}
