/**
 * Workout Template Helpers - Pure Functions
 *
 * Helper per gestione template workout (estrazione dati, re-ID, etc.)
 * Segue principi KISS, DRY, SOLID
 *
 * SSOT: Usa SOLO setGroups per le serie, non exercise.sets legacy.
 */
import { createId } from '@onecoach/lib-shared/utils/id-generator';
/**
 * Estrae dati template in base al tipo
 */
export function extractTemplateData(template) {
    return template.data;
}
/**
 * Re-ID tutti gli esercizi, giorni e settimane in un template per evitare conflitti
 */
export function reIdTemplateData(data, type) {
    switch (type) {
        case 'exercise': {
            const exercise = data;
            // SSOT: Solo setGroups, non exercise.sets
            return {
                ...exercise,
                id: createId('exercise'),
                setGroups: exercise.setGroups?.map((group) => ({
                    ...group,
                    id: createId('setgroup'),
                    sets: group.sets.map((set) => ({ ...set })),
                })),
            };
        }
        case 'day': {
            const day = data;
            return {
                ...day,
                exercises: day.exercises.map((exercise) => ({
                    ...exercise,
                    id: createId('exercise'),
                    setGroups: exercise.setGroups?.map((group) => ({
                        ...group,
                        id: createId('setgroup'),
                        sets: group.sets.map((set) => ({ ...set })),
                    })),
                })),
            };
        }
        case 'week': {
            const week = data;
            return {
                ...week,
                days: week.days.map((day) => ({
                    ...day,
                    exercises: day.exercises.map((exercise) => ({
                        ...exercise,
                        id: createId('exercise'),
                        setGroups: exercise.setGroups?.map((group) => ({
                            ...group,
                            id: createId('setgroup'),
                            sets: group.sets.map((set) => ({ ...set })),
                        })),
                    })),
                })),
            };
        }
        default:
            return data;
    }
}
