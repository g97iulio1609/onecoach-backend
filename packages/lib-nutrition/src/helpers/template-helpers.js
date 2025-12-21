/**
 * Template Helpers - Pure Functions
 *
 * Helper per gestione template (estrazione dati, re-ID, etc.)
 * Segue principi KISS, DRY, SOLID
 */
/**
 * Estrae dati template in base al tipo
 */
export function extractTemplateData(template) {
    return template.data;
}
/**
 * Re-ID tutti i pasti e alimenti in un template per evitare conflitti
 */
export function reIdTemplateData(data, type) {
    const timestamp = Date.now();
    switch (type) {
        case 'meal': {
            const meal = data;
            return {
                ...meal,
                id: `meal-${timestamp}-${Math.random()}`,
                foods: meal.foods.map((food) => ({
                    ...food,
                    id: `food-${timestamp}-${Math.random()}`,
                })),
            };
        }
        case 'day': {
            const day = data;
            return {
                ...day,
                meals: day.meals.map((meal) => ({
                    ...meal,
                    id: `meal-${timestamp}-${Math.random()}`,
                    foods: meal.foods.map((food) => ({
                        ...food,
                        id: `food-${timestamp}-${Math.random()}`,
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
                    meals: day.meals.map((meal) => ({
                        ...meal,
                        id: `meal-${timestamp}-${Math.random()}`,
                        foods: meal.foods.map((food) => ({
                            ...food,
                            id: `food-${timestamp}-${Math.random()}`,
                        })),
                    })),
                })),
            };
        }
        default:
            return data;
    }
}
