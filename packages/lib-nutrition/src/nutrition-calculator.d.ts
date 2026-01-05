export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type NutritionGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance' | 'health' | 'body_recomposition';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean';
export interface UserMetrics {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: Gender;
    activityLevel: ActivityLevel;
}
export interface MacroDistribution {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
}
export interface NutritionTargets {
    bmr: number;
    tdee: number;
    targetCalories: number;
    deficit?: number;
    surplus?: number;
    macros: MacroDistribution;
}
export interface CalorieCalculationResult {
    bmr: number;
    tdee: number;
}
export interface MacroRatios {
    proteinRatio: number;
    carbsRatio: number;
    fatRatio: number;
}
/**
 * Moltiplicatori attività per calcolo TDEE
 * Basati su letteratura scientifica standard
 */
export declare const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number>;
/**
 * Kcal per grammo di macronutriente
 */
export declare const KCAL_PER_GRAM: {
    readonly protein: 4;
    readonly carbs: 4;
    readonly fat: 9;
};
/**
 * Proteine raccomandate per kg di peso corporeo in base al goal
 * Basate su evidenze scientifiche (ISSN, ACSM)
 */
export declare const PROTEIN_PER_KG_BY_GOAL: Record<NutritionGoal, {
    min: number;
    max: number;
}>;
/**
 * Distribuzione macro di DEFAULT per diet type
 * Valori in % delle calorie totali
 * L'AI può modificare questi valori entro i range sicuri
 */
export declare const DEFAULT_MACRO_RATIOS_BY_DIET: Record<DietType, MacroRatios>;
/**
 * Range sicuri per validazione
 */
export declare const SAFETY_RANGES: {
    readonly minCalories: 1200;
    readonly maxCalories: 5000;
    readonly maxDeficit: 1000;
    readonly maxSurplus: 500;
    readonly fat: {
        readonly min: 0.15;
        readonly max: 0.45;
    };
    readonly protein: {
        readonly min: 0.1;
        readonly max: 0.4;
    };
    readonly carbs: {
        readonly min: 0.05;
        readonly max: 0.65;
    };
    readonly proteinPerKg: {
        readonly min: 0.8;
        readonly max: 3;
    };
    readonly bmr: {
        readonly min: 1000;
        readonly max: 3000;
    };
    readonly tdee: {
        readonly min: 1200;
        readonly max: 5500;
    };
};
/**
 * Calcola il BMR usando la formula Mifflin-St Jeor
 * Considerata la più accurata per la popolazione generale
 *
 * Formula:
 * - Uomini: (10 × peso in kg) + (6.25 × altezza in cm) - (5 × età) + 5
 * - Donne: (10 × peso in kg) + (6.25 × altezza in cm) - (5 × età) - 161
 */
export declare function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number;
/**
 * Calcola il TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Moltiplicatore Attività
 */
export declare function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number;
/**
 * Calcola BMR e TDEE insieme
 * Funzione di convenienza per ottenere entrambi i valori
 */
export declare function calculateCalorieNeeds(metrics: UserMetrics): CalorieCalculationResult;
/**
 * Calcola i macro in grammi da calorie e ratios
 */
export declare function calculateMacrosFromRatios(targetCalories: number, ratios: MacroRatios): MacroDistribution;
/**
 * Calcola i macro basandosi su diet type, goal e peso
 * Usa proteine basate sul peso (g/kg) e distribuisce il resto
 */
export declare function calculateMacrosByDietType(targetCalories: number, dietType: DietType, weightKg: number, goal: NutritionGoal): MacroDistribution;
/**
 * Suggerisce calorie target basate su goal
 * NOTA: Questi sono valori di riferimento, l'AI può modificarli
 * entro i range sicuri definiti in SAFETY_RANGES
 */
export declare function suggestTargetCalories(tdee: number, goal: NutritionGoal): {
    targetCalories: number;
    deficit?: number;
    surplus?: number;
};
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Valida che i valori nutrizionali siano nei range sicuri
 */
export declare function validateNutritionTargets(targets: NutritionTargets, weightKg: number): ValidationResult;
/**
 * Valida macro ratios
 */
export declare function validateMacroRatios(ratios: MacroRatios): ValidationResult;
/**
 * Calcola tutti i target nutrizionali in un'unica chiamata
 * Questa è la funzione principale da usare per ottenere tutti i valori
 */
export declare function calculateCompleteNutritionTargets(metrics: UserMetrics, goal: NutritionGoal, dietType?: DietType): NutritionTargets;
/**
 * Converte macro in calorie
 */
export declare function macrosToCalories(macros: Omit<MacroDistribution, 'calories'>): number;
/**
 * Calcola le percentuali macro dalle calorie
 */
export declare function getMacroPercentages(macros: MacroDistribution): {
    protein: number;
    carbs: number;
    fat: number;
};
/**
 * Formatta i target nutrizionali per display
 */
export declare function formatNutritionTargets(targets: NutritionTargets): string;
//# sourceMappingURL=nutrition-calculator.d.ts.map