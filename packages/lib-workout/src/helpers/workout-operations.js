/**
 * Workout Operations
 *
 * Funzioni pure per operazioni CRUD su workout programs
 * Segue il pattern di lib/nutrition/plan-operations.ts
 */
import { createEmptyWeek, createEmptyDay, createEmptyExercise } from './program-transform';
import { createId } from '@onecoach/lib-shared/utils/id-generator';
import { DEFAULT_SET } from './constants';
import { kgToLbs } from '@onecoach/lib-shared';
import { getWorkoutProgramWeek, getWorkoutProgramDayByWeek, } from '@onecoach/lib-shared/utils/workout-program-helpers';
/**
 * Aggiunge una nuova settimana al programma
 */
export function addWorkoutWeek(program) {
    const nextWeekNumber = program.weeks.length + 1;
    const newWeek = createEmptyWeek(nextWeekNumber);
    const updatedWeeks = [...program.weeks, newWeek];
    return {
        program: {
            ...program,
            weeks: updatedWeeks,
            durationWeeks: updatedWeeks.length,
        },
        weekNumber: nextWeekNumber,
    };
}
/**
 * Rimuove una settimana dal programma e riindicizza le settimane rimanenti
 */
export function removeWeek(program, weekNumber) {
    const filteredWeeks = program.weeks.filter((week) => week.weekNumber !== weekNumber);
    const reindexed = filteredWeeks.map((week, index) => ({
        ...week,
        weekNumber: index + 1,
    }));
    return {
        ...program,
        weeks: reindexed,
        durationWeeks: reindexed.length || program.durationWeeks,
    };
}
/**
 * Aggiunge un nuovo giorno alla settimana specificata
 */
export function addDay(program, weekNumber) {
    const targetWeek = getWorkoutProgramWeek(program, weekNumber);
    if (!targetWeek) {
        throw new Error(`Settimana ${weekNumber} non trovata`);
    }
    const nextDayNumber = targetWeek.days.length + 1;
    const newDay = createEmptyDay(weekNumber, nextDayNumber);
    const updatedWeeks = program.weeks.map((week) => week.weekNumber === weekNumber
        ? {
            ...week,
            days: [...week.days, newDay],
        }
        : week);
    return {
        program: {
            ...program,
            weeks: updatedWeeks,
        },
        weekNumber,
        dayNumber: nextDayNumber,
    };
}
/**
 * Rimuove un giorno dalla settimana specificata e riindicizza i giorni rimanenti
 */
export function removeDay(program, weekNumber, dayNumber) {
    const updatedWeeks = program.weeks.map((week) => {
        if (week.weekNumber !== weekNumber) {
            return week;
        }
        const remainingDays = week.days.filter((day) => day.dayNumber !== dayNumber);
        const reindexedDays = remainingDays.map((day, index) => ({
            ...day,
            dayNumber: index + 1,
        }));
        return {
            ...week,
            days: reindexedDays,
        };
    });
    return {
        ...program,
        weeks: updatedWeeks,
    };
}
/**
 * Aggiunge un esercizio al giorno specificato
 */
export function addExercise(program, weekNumber, dayNumber, exercise) {
    const newExercise = exercise || createEmptyExercise();
    const updatedWeeks = program.weeks.map((week) => week.weekNumber === weekNumber
        ? {
            ...week,
            days: week.days.map((day) => day.dayNumber === dayNumber
                ? { ...day, exercises: [...day.exercises, newExercise] }
                : day),
        }
        : week);
    return {
        ...program,
        weeks: updatedWeeks,
    };
}
/**
 * Rimuove un esercizio dal giorno specificato
 */
export function removeExercise(program, weekNumber, dayNumber, exerciseId) {
    const updatedWeeks = program.weeks.map((week) => week.weekNumber === weekNumber
        ? {
            ...week,
            days: week.days.map((day) => day.dayNumber === dayNumber
                ? {
                    ...day,
                    exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
                }
                : day),
        }
        : week);
    return {
        ...program,
        weeks: updatedWeeks,
    };
}
/**
 * Aggiorna un esercizio esistente
 */
export function updateExercise(program, weekNumber, dayNumber, exerciseId, updates) {
    const updatedWeeks = program.weeks.map((week) => week.weekNumber === weekNumber
        ? {
            ...week,
            days: week.days.map((day) => day.dayNumber === dayNumber
                ? {
                    ...day,
                    exercises: day.exercises.map((ex) => ex.id === exerciseId ? { ...ex, ...updates } : ex),
                }
                : day),
        }
        : week);
    return {
        ...program,
        weeks: updatedWeeks,
    };
}
/**
 * Aggiorna un giorno esistente
 */
export function updateDay(program, weekNumber, dayNumber, updates) {
    const updatedWeeks = program.weeks.map((week) => week.weekNumber === weekNumber
        ? {
            ...week,
            days: week.days.map((day) => day.dayNumber === dayNumber ? { ...day, ...updates } : day),
        }
        : week);
    return {
        ...program,
        weeks: updatedWeeks,
    };
}
/**
 * Aggiorna una settimana esistente
 */
export function updateWeek(program, weekNumber, updates) {
    const updatedWeeks = program.weeks.map((week) => week.weekNumber === weekNumber ? { ...week, ...updates } : week);
    return {
        ...program,
        weeks: updatedWeeks,
    };
}
/**
 * Aggiunge un nuovo gruppo di serie a un esercizio nel programma
 * (Operation: modifica il programma)
 */
export function addSetGroupToExercise(program, weekNumber, dayNumber, exerciseId, baseSet, count) {
    const newGroup = {
        id: createId('setgroup'),
        count,
        baseSet,
        sets: Array.from({ length: count }, () => ({ ...baseSet })),
    };
    const day = getWorkoutProgramDayByWeek(program, weekNumber, dayNumber);
    const exercise = day?.exercises.find((e) => e.id === exerciseId);
    return updateExercise(program, weekNumber, dayNumber, exerciseId, {
        setGroups: [...(exercise?.setGroups || []), newGroup],
    });
}
/**
 * Alias ergonomico per creare e aggiungere un nuovo SetGroup a un esercizio.
 */
export function createSetGroup(program, weekNumber, dayNumber, exerciseId, baseSet, count) {
    return addSetGroupToExercise(program, weekNumber, dayNumber, exerciseId, baseSet, count);
}
/**
 * Raggruppa serie selezionate in un gruppo
 * SSOT: Usa setGroups per accedere alle serie, non exercise.sets legacy
 */
export function groupSelectedSets(program, weekNumber, dayNumber, exerciseId, setIndices) {
    if (setIndices.length < 2) {
        return program;
    }
    const day = getWorkoutProgramDayByWeek(program, weekNumber, dayNumber);
    const exercise = day?.exercises.find((e) => e.id === exerciseId);
    if (!exercise) {
        return program;
    }
    // SSOT: Usa setGroups per accedere a tutte le serie
    const allSets = [];
    (exercise.setGroups || []).forEach((group) => {
        allSets.push(...group.sets);
    });
    // Calcola parametri medi per il baseSet
    const selectedSets = setIndices
        .map((idx) => allSets[idx])
        .filter((s) => s !== undefined);
    if (selectedSets.length === 0) {
        return program;
    }
    const avgReps = selectedSets.reduce((sum, s) => sum + (s.reps ?? 0), 0) /
        selectedSets.length;
    const avgWeight = selectedSets.reduce((sum, s) => sum + (s.weight ?? 0), 0) /
        selectedSets.length;
    const avgIntensity = selectedSets.reduce((sum, s) => sum + (s.intensityPercent ?? 0), 0) /
        selectedSets.length;
    const avgRest = selectedSets.reduce((sum, s) => sum + (s.rest ?? 0), 0) /
        selectedSets.length;
    const baseSet = {
        reps: Math.round(avgReps) || undefined,
        weight: avgWeight > 0 ? avgWeight : null,
        weightLbs: avgWeight > 0 ? kgToLbs(avgWeight) : null,
        intensityPercent: avgIntensity > 0 ? avgIntensity : null,
        rpe: null,
        rest: Math.round(avgRest) || DEFAULT_SET.rest,
    };
    const newGroup = {
        id: createId('setgroup'),
        count: setIndices.length,
        baseSet,
        sets: selectedSets,
    };
    // SSOT: Rimuovi serie selezionate dai setGroups esistenti e aggiungi nuovo gruppo
    const remainingSets = allSets.filter((_, idx) => !setIndices.includes(idx));
    // Ricostruisci setGroups con le serie rimanenti + nuovo gruppo
    const updatedSetGroups = [];
    if (remainingSets.length > 0) {
        // Crea un gruppo per le serie rimanenti
        updatedSetGroups.push({
            id: createId('setgroup'),
            count: remainingSets.length,
            baseSet: remainingSets[0] || DEFAULT_SET,
            sets: remainingSets,
        });
    }
    updatedSetGroups.push(newGroup);
    return updateExercise(program, weekNumber, dayNumber, exerciseId, {
        setGroups: updatedSetGroups,
    });
}
/**
 * Separa un gruppo di serie tornando le serie individuali
 */
export function splitSetGroup(program, weekNumber, dayNumber, exerciseId, groupId) {
    const day = getWorkoutProgramDayByWeek(program, weekNumber, dayNumber);
    const exercise = day?.exercises.find((e) => e.id === exerciseId);
    if (!exercise || !exercise.setGroups) {
        return program;
    }
    const group = exercise.setGroups.find((g) => g.id === groupId);
    if (!group) {
        return program;
    }
    // SSOT: Unisci le serie del gruppo agli altri setGroups esistenti
    // Creiamo un nuovo setGroup con tutte le serie "libere" del gruppo eliminato
    const otherGroups = exercise.setGroups.filter((g) => g.id !== groupId);
    const freedSets = group.sets;
    // Se ci sono altri gruppi, aggiungi le serie libere come nuovo gruppo
    let newGroups;
    if (freedSets.length > 0) {
        const freedGroup = {
            id: createId('setgroup'),
            count: freedSets.length,
            baseSet: freedSets[0] || DEFAULT_SET,
            sets: freedSets,
        };
        newGroups = [...otherGroups, freedGroup];
    }
    else {
        newGroups = otherGroups;
    }
    return updateExercise(program, weekNumber, dayNumber, exerciseId, {
        setGroups: newGroups.length > 0 ? newGroups : undefined,
    });
}
/**
 * Rimuove un gruppo di serie
 */
export function removeSetGroup(program, weekNumber, dayNumber, exerciseId, groupId) {
    const day = getWorkoutProgramDayByWeek(program, weekNumber, dayNumber);
    const exercise = day?.exercises.find((e) => e.id === exerciseId);
    if (!exercise || !exercise.setGroups) {
        return program;
    }
    const newGroups = exercise.setGroups.filter((g) => g.id !== groupId);
    return updateExercise(program, weekNumber, dayNumber, exerciseId, {
        setGroups: newGroups.length > 0 ? newGroups : undefined,
    });
}
/**
 * Duplica un gruppo di serie
 */
export function duplicateSetGroup(program, weekNumber, dayNumber, exerciseId, groupId) {
    const day = getWorkoutProgramDayByWeek(program, weekNumber, dayNumber);
    const exercise = day?.exercises.find((e) => e.id === exerciseId);
    if (!exercise || !exercise.setGroups) {
        return program;
    }
    const group = exercise.setGroups.find((g) => g.id === groupId);
    if (!group) {
        return program;
    }
    const duplicatedGroup = {
        ...group,
        id: createId('setgroup'),
        sets: group.sets.map((s) => ({ ...s })),
    };
    if (duplicatedGroup.progression) {
        duplicatedGroup.progression = {
            ...duplicatedGroup.progression,
            steps: duplicatedGroup.progression.steps.map((s) => ({ ...s })),
        };
    }
    return updateExercise(program, weekNumber, dayNumber, exerciseId, {
        setGroups: [...(exercise.setGroups || []), duplicatedGroup],
    });
}
