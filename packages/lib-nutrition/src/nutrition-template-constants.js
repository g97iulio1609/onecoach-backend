/**
 * Nutrition Template Constants
 *
 * Costanti e utility statiche per template nutrizionali
 * Separato dal service per evitare import di prisma in client components
 */
/**
 * Ottiene categorie disponibili per template nutrizionali
 */
export function getAvailableCategories() {
    return [
        'colazione',
        'pranzo',
        'cena',
        'snack',
        'pre-workout',
        'post-workout',
        'cut',
        'bulk',
        'maintenance',
        'vegetariano',
        'vegano',
        'keto',
        'low-carb',
        'high-protein',
    ];
}
