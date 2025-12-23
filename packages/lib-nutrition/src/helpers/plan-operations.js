/**
 * Plan Operations - Pure Functions
 *
 * Funzioni pure per operazioni CRUD su piani nutrizionali
 * Segue principi KISS, DRY, SOLID
 */
import { createEmptyDay, createEmptyWeek } from './plan-transform';
import { getNutritionPlanTotalDays } from '@onecoach/lib-shared/utils/nutrition-plan-helpers';
import { calculateMacros, recalculateDay } from '@onecoach/lib-shared/utils/macro-calculations';
import {  createId  } from '@onecoach/lib-shared/utils/id-generator';
/**
 * Aggiunge una nuova settimana al piano
 */
export function addNutritionWeek(plan) {
    const totalDays = getNutritionPlanTotalDays(plan);
    const nextWeekNumber = (plan.weeks?.length || 0) + 1;
    const nextDayNumber = totalDays + 1;
    const newWeek = {
        id: createId(),
        weekNumber: nextWeekNumber,
        days: [createEmptyDay(nextDayNumber)],
        weeklyAverageMacros: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
        notes: '',
    };
    return {
        plan: {
            ...plan,
            weeks: [...(plan.weeks || []), newWeek],
        },
        weekNumber: nextWeekNumber,
    };
}
/**
 * Rimuove una settimana dal piano e rinumera le rimanenti
 */
export function removeWeek(plan, weekNumber) {
    const updatedWeeks = plan.weeks.filter((w) => w.weekNumber !== weekNumber);
    // Renumber weeks
    const renumberedWeeks = updatedWeeks.map((week, index) => ({
        ...week,
        weekNumber: index + 1,
    }));
    // Renumber days across all weeks
    let dayCounter = 0;
    const finalWeeks = renumberedWeeks.map((week) => ({
        ...week,
        days: (week.days || []).map((day) => {
            dayCounter++;
            return {
                ...day,
                dayNumber: dayCounter,
            };
        }),
    }));
    return {
        ...plan,
        weeks: finalWeeks,
    };
}
/**
 * Aggiunge un giorno al piano (aggiunge all'ultima settimana o crea nuova)
 */
export function addDay(plan) {
    const totalDays = getNutritionPlanTotalDays(plan);
    const nextDayNumber = totalDays + 1;
    const weeks = [...(plan.weeks || [])];
    if (weeks.length === 0) {
        weeks.push(createEmptyWeek(1));
    }
    else {
        const lastWeek = weeks[weeks.length - 1];
        if (!lastWeek) {
            weeks.push({
                ...createEmptyWeek(1),
                days: [createEmptyDay(nextDayNumber)],
            });
            return {
                plan: {
                    ...plan,
                    weeks,
                },
                weekNumber: 1,
                dayNumber: nextDayNumber,
            };
        }
        const daysInLastWeek = lastWeek.days?.length || 0;
        if (daysInLastWeek < 7) {
            // Add to last week
            weeks[weeks.length - 1] = {
                ...lastWeek,
                days: [...(lastWeek.days || []), createEmptyDay(nextDayNumber)],
            };
        }
        else {
            // Create new week
            weeks.push({
                ...createEmptyWeek(weeks.length + 1),
                days: [createEmptyDay(nextDayNumber)],
            });
        }
    }
    const lastWeekForNumber = weeks[weeks.length - 1];
    if (!lastWeekForNumber) {
        throw new Error('Unexpected: weeks array is empty after processing');
    }
    const weekNumber = lastWeekForNumber.weekNumber;
    return {
        plan: {
            ...plan,
            weeks,
        },
        weekNumber,
        dayNumber: nextDayNumber,
    };
}
/**
 * Rimuove un giorno dal piano e rinumera i giorni rimanenti
 */
export function removeDay(plan, dayNumber) {
    // Find and remove the day from weeks structure
    let dayCounter = 0;
    const updatedWeeks = plan.weeks
        .map((week) => {
        const filteredDays = (week.days || []).filter(() => {
            dayCounter++;
            return dayCounter !== dayNumber;
        });
        // If week is empty after removal, return null to filter it out
        if (filteredDays.length === 0) {
            return null;
        }
        return {
            ...week,
            days: filteredDays,
        };
    })
        .filter((week) => week !== null);
    // Renumber days after removal
    let newDayCounter = 0;
    const renumberedWeeks = updatedWeeks.map((week) => ({
        ...week,
        days: (week.days || []).map((day) => {
            newDayCounter++;
            return {
                ...day,
                dayNumber: newDayCounter,
            };
        }),
    }));
    return {
        ...plan,
        weeks: renumberedWeeks,
    };
}
/**
 * Aggiunge un pasto a un giorno
 */
export function addMeal(plan, dayNumber, templateMeal) {
    const timestamp = Date.now();
    const newMeal = templateMeal
        ? {
            ...templateMeal,
            id: `meal-${timestamp}`,
            foods: templateMeal.foods.map((food) => ({
                ...food,
                id: `food-${timestamp}-${Math.random()}`,
            })),
        }
        : {
            id: `meal-${timestamp}`,
            name: 'Nuovo pasto',
            type: 'lunch',
            foods: [],
            totalMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
            notes: '',
        };
    const updatedWeeks = plan.weeks.map((week) => ({
        ...week,
        days: (week.days || []).map((day) => {
            if (day.dayNumber === dayNumber) {
                return {
                    ...day,
                    meals: [...day.meals, newMeal],
                };
            }
            return day;
        }),
    }));
    return {
        ...plan,
        weeks: updatedWeeks,
    };
}
/**
 * Rimuove un pasto da un giorno
 */
export function removeMeal(plan, dayNumber, mealId) {
    const updatedWeeks = plan.weeks.map((week) => ({
        ...week,
        days: (week.days || []).map((day) => {
            if (day.dayNumber === dayNumber) {
                return {
                    ...day,
                    meals: day.meals.filter((m) => m.id !== mealId),
                };
            }
            return day;
        }),
    }));
    return {
        ...plan,
        weeks: updatedWeeks,
    };
}
/**
 * Aggiunge un alimento a un pasto
 */
export function addFood(plan, dayNumber, mealId, food) {
    const updatedWeeks = plan.weeks.map((week) => ({
        ...week,
        days: (week.days || []).map((day) => {
            if (day.dayNumber === dayNumber) {
                return {
                    ...day,
                    meals: day.meals.map((meal) => {
                        if (meal.id === mealId) {
                            const updatedFoods = [...meal.foods, food];
                            return {
                                ...meal,
                                foods: updatedFoods,
                                totalMacros: calculateMacros(updatedFoods),
                            };
                        }
                        return meal;
                    }),
                };
            }
            return day;
        }),
    }));
    return {
        ...plan,
        weeks: updatedWeeks,
    };
}
/**
 * Rimuove un alimento da un pasto
 */
export function removeFood(plan, dayNumber, mealId, foodId) {
    const updatedWeeks = plan.weeks.map((week) => ({
        ...week,
        days: (week.days || []).map((day) => {
            if (day.dayNumber === dayNumber) {
                return {
                    ...day,
                    meals: day.meals.map((meal) => {
                        if (meal.id === mealId) {
                            const updatedFoods = meal.foods.filter((food) => food.id !== foodId);
                            return {
                                ...meal,
                                foods: updatedFoods,
                                totalMacros: calculateMacros(updatedFoods),
                            };
                        }
                        return meal;
                    }),
                };
            }
            return day;
        }),
    }));
    return {
        ...plan,
        weeks: updatedWeeks,
    };
}
/**
 * Aggiorna un alimento in un pasto
 */
export function updateFood(plan, dayNumber, mealId, foodId, updates) {
    const updatedWeeks = plan.weeks.map((week) => ({
        ...week,
        days: (week.days || []).map((day) => {
            if (day.dayNumber === dayNumber) {
                // Aggiorna l'alimento nel pasto
                const updatedDay = {
                    ...day,
                    meals: day.meals.map((meal) => {
                        if (meal.id === mealId) {
                            const updatedFoods = meal.foods.map((food) => {
                                if (food.id === foodId) {
                                    return { ...food, ...updates };
                                }
                                return food;
                            });
                            return {
                                ...meal,
                                foods: updatedFoods,
                                totalMacros: calculateMacros(updatedFoods),
                            };
                        }
                        return meal;
                    }),
                };
                // Ricalcola i totalMacros del giorno usando recalculateDay
                return recalculateDay(updatedDay);
            }
            return day;
        }),
    }));
    return {
        ...plan,
        weeks: updatedWeeks,
    };
}
/**
 * Aggiorna un giorno usando un updater function
 */
export function updateDay(plan, dayNumber, updater) {
    const updatedWeeks = plan.weeks.map((week) => ({
        ...week,
        days: (week.days || []).map((day) => {
            return day.dayNumber === dayNumber ? updater(day) : day;
        }),
    }));
    return {
        ...plan,
        weeks: updatedWeeks,
    };
}
