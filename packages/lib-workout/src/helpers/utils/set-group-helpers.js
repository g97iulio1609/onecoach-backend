/**
 * SetGroup Helpers
 *
 * SSOT utilities per manipolazione SetGroup.
 * Usare SEMPRE questi helper invece di accedere direttamente a exercise.sets.
 *
 * Principi SOLID:
 * - Single Responsibility: ogni funzione fa una cosa sola
 * - Open/Closed: estendibile senza modificare
 * - DRY: logica centralizzata qui
 */
/**
 * Genera un ID univoco per SetGroup
 */
export function generateSetGroupId() {
    return `setgroup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Calcola le serie espanse da baseSet + count + progression opzionale.
 * Questa è la funzione core per idratare SetGroup.sets[].
 *
 * @param baseSet - Parametri base per tutte le serie
 * @param count - Numero di serie da generare
 * @param progression - Progressione opzionale tra serie
 * @returns Array di ExerciseSet espansi
 *
 * @example
 * // 4 serie identiche
 * const sets = expandSetsFromGroup(baseSet, 4);
 *
 * // 4 serie con progressione lineare +2.5kg
 * const setsWithProgression = expandSetsFromGroup(baseSet, 4, {
 *   type: 'linear',
 *   steps: [{ fromSet: 1, toSet: 4, adjustment: 2.5 }]
 * });
 */
export function expandSetsFromGroup(baseSet, count, progression) {
    const sets = [];
    for (let i = 0; i < count; i++) {
        const setNumber = i + 1; // 1-based
        let adjustedSet = { ...baseSet };
        if (progression) {
            adjustedSet = applyProgressionToSet(adjustedSet, setNumber, progression);
        }
        sets.push(adjustedSet);
    }
    return sets;
}
/**
 * Applica la progressione a una singola serie.
 */
function applyProgressionToSet(set, setNumber, progression) {
    const adjustedSet = { ...set };
    for (const step of progression.steps) {
        if (setNumber >= step.fromSet && setNumber <= step.toSet) {
            const progressInRange = setNumber - step.fromSet;
            switch (progression.type) {
                case 'linear':
                    // Incremento lineare in kg
                    if (adjustedSet.weight !== null) {
                        adjustedSet.weight = adjustedSet.weight + step.adjustment * progressInRange;
                    }
                    break;
                case 'percentage':
                    // Incremento percentuale
                    if (adjustedSet.weight !== null) {
                        const percentMultiplier = 1 + (step.adjustment / 100) * progressInRange;
                        adjustedSet.weight = Math.round(adjustedSet.weight * percentMultiplier * 10) / 10;
                    }
                    break;
                case 'rpe':
                    // Incremento RPE
                    if (adjustedSet.rpe !== null) {
                        adjustedSet.rpe = Math.min(10, adjustedSet.rpe + step.adjustment * progressInRange);
                    }
                    break;
            }
        }
    }
    return adjustedSet;
}
/**
 * Idrata tutti i SetGroup di un esercizio, popolando sets[] da baseSet + count.
 * Utile quando si caricano esercizi dal DB che hanno solo baseSet/count.
 *
 * @param setGroups - Array di SetGroup da idratare
 * @returns SetGroup[] con sets[] popolati
 */
export function hydrateSetGroups(setGroups) {
    return setGroups.map((group) => ({
        ...group,
        sets: group.sets && group.sets.length > 0
            ? group.sets
            : expandSetsFromGroup(group.baseSet, group.count, group.progression),
    }));
}
/**
 * Estrae tutte le serie espanse da un array di SetGroup.
 * Utile per calcoli di volume, analytics, ecc.
 *
 * @param setGroups - Array di SetGroup
 * @returns Array flat di ExerciseSet
 *
 * @example
 * const allSets = getExpandedSets(exercise.setGroups);
 * const totalVolume = allSets.reduce((sum: any, set: any) => sum + (set.reps * set.weight), 0);
 */
export function getExpandedSets(setGroups) {
    const hydratedGroups = hydrateSetGroups(setGroups);
    return hydratedGroups.flatMap((group) => group.sets);
}
/**
 * Estrae tutte le serie da un esercizio.
 * USARE QUESTO invece di accedere a exercise.sets.
 *
 * @param exercise - Esercizio da cui estrarre le serie
 * @returns Array di ExerciseSet
 */
export function getExerciseSets(exercise) {
    if (!exercise.setGroups || exercise.setGroups.length === 0) {
        return [];
    }
    return getExpandedSets(exercise.setGroups);
}
/**
 * Crea un SetGroup da parametri semplici.
 * Utile per il Visual Builder quando si aggiunge un nuovo gruppo di serie.
 *
 * @param count - Numero di serie
 * @param baseSetParams - Parametri per la serie base
 * @returns SetGroup completo con sets[] espansi
 */
export function createSetGroupFromParams(count, baseSetParams) {
    const baseSet = {
        reps: baseSetParams.reps,
        repsMax: baseSetParams.repsMax,
        duration: baseSetParams.duration,
        weight: baseSetParams.weight ?? null,
        weightMax: baseSetParams.weightMax,
        weightLbs: baseSetParams.weightLbs ?? null,
        intensityPercent: baseSetParams.intensityPercent ?? null,
        intensityPercentMax: baseSetParams.intensityPercentMax,
        rpe: baseSetParams.rpe ?? null,
        rpeMax: baseSetParams.rpeMax,
        rest: baseSetParams.rest,
    };
    return {
        id: generateSetGroupId(),
        count,
        baseSet,
        sets: expandSetsFromGroup(baseSet, count),
    };
}
/**
 * Aggiunge una progressione a un SetGroup esistente e rigenera sets[].
 *
 * @param setGroup - SetGroup esistente
 * @param progression - Progressione da applicare
 * @returns Nuovo SetGroup con progressione e sets[] aggiornati
 */
export function addProgressionToSetGroup(setGroup, progression) {
    return {
        ...setGroup,
        progression,
        sets: expandSetsFromGroup(setGroup.baseSet, setGroup.count, progression),
    };
}
/**
 * Calcola il volume totale di un SetGroup.
 * Volume = Σ(reps × weight) per ogni serie.
 */
export function calculateSetGroupVolume(setGroup) {
    const sets = setGroup.sets.length > 0
        ? setGroup.sets
        : expandSetsFromGroup(setGroup.baseSet, setGroup.count, setGroup.progression);
    return sets.reduce((total, set) => {
        const reps = set.reps ?? 0;
        const weight = set.weight ?? 0;
        return total + reps * weight;
    }, 0);
}
/**
 * Calcola il volume totale di un esercizio.
 */
export function calculateExerciseVolume(exercise) {
    if (!exercise.setGroups || exercise.setGroups.length === 0) {
        return 0;
    }
    return exercise.setGroups.reduce((total, group) => total + calculateSetGroupVolume(group), 0);
}
/**
 * Conta il numero totale di serie di un esercizio.
 */
export function countExerciseSets(exercise) {
    if (!exercise.setGroups || exercise.setGroups.length === 0) {
        return 0;
    }
    return exercise.setGroups.reduce((total, group) => total + group.count, 0);
}
/**
 * Valida che un SetGroup sia valido.
 */
export function isValidSetGroup(setGroup) {
    if (!setGroup || typeof setGroup !== 'object')
        return false;
    const sg = setGroup;
    return (typeof sg.id === 'string' &&
        sg.id.length > 0 &&
        typeof sg.count === 'number' &&
        sg.count > 0 &&
        sg.baseSet !== null &&
        typeof sg.baseSet === 'object' &&
        Array.isArray(sg.sets));
}
/**
 * Valida che un esercizio abbia setGroups validi.
 */
export function hasValidSetGroups(exercise) {
    if (!exercise || typeof exercise !== 'object')
        return false;
    const ex = exercise;
    if (!Array.isArray(ex.setGroups))
        return false;
    return ex.setGroups.length > 0 && ex.setGroups.every(isValidSetGroup);
}
