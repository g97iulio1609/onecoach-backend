/**
 * Calcola il peso (kg) da intensità percentuale e 1RM
 * @param oneRepMax - Massimale 1RM in kg
 * @param intensityPercent - Intensità percentuale (0-100)
 * @returns Peso calcolato in kg
 */
export declare function calculateWeightFromIntensity(oneRepMax: number, intensityPercent: number): number;
/**
 * Calcola l'intensità percentuale da peso e 1RM
 * @param weight - Peso sollevato in kg
 * @param oneRepMax - Massimale 1RM in kg
 * @returns Intensità percentuale (0-100)
 */
export declare function calculateIntensityFromWeight(weight: number, oneRepMax: number): number;
/**
 * Calcola il peso (kg) da RPE e reps usando la tabella RTS
 *
 * @param oneRepMax - Massimale 1RM in kg
 * @param reps - Numero di ripetizioni target
 * @param rpe - Rate of Perceived Exertion (6.5-10)
 * @returns Peso calcolato in kg
 *
 * @example
 * // Per 5 reps a RPE 8 con 1RM di 100kg
 * calculateWeightFromRPE(100, 5, 8) // ~81.1kg
 */
export declare function calculateWeightFromRPE(oneRepMax: number, reps: number, rpe: number): number;
/**
 * Calcola l'intensità percentuale da RPE e reps
 *
 * @param reps - Numero di ripetizioni
 * @param rpe - Rate of Perceived Exertion (6.5-10)
 * @returns Intensità percentuale (0-100)
 */
export declare function calculateIntensityFromRPE(reps: number, rpe: number): number;
/**
 * Calcola RPE da peso, 1RM e reps
 *
 * @param weight - Peso sollevato in kg
 * @param oneRepMax - Massimale 1RM in kg
 * @param reps - Numero di ripetizioni
 * @returns RPE stimato (6.5-10)
 */
export declare function calculateRPEFromWeight(weight: number, oneRepMax: number, reps: number): number;
/**
 * Calcola RPE da intensità e reps
 *
 * @param intensityPercent - Intensità percentuale (0-100)
 * @param reps - Numero di ripetizioni
 * @returns RPE stimato (6.5-10)
 */
export declare function calculateRPEFromIntensity(intensityPercent: number, reps: number): number;
/**
 * Stima il 1RM da reps, peso e RPE usando la formula di Epley
 * Formula: 1RM = weight * (1 + reps / 30)
 * Con correzione RPE: se RPE < 10, aggiungi reps potenziali
 * @param reps - Numero di ripetizioni eseguite
 * @param weight - Peso sollevato in kg
 * @param rpe - Rate of Perceived Exertion (1-10, opzionale)
 * @returns Stima del 1RM in kg
 */
export declare function estimateOneRMFromReps(reps: number, weight: number, rpe?: number): number;
/**
 * Calcoli bidirezionali con priorità campo in focus
 * Ritorna i valori calcolati per weight, intensity, rpe
 */
export interface SyncedValues {
    weight?: number;
    weightMax?: number;
    weightLbs?: number;
    intensityPercent?: number;
    intensityPercentMax?: number;
    rpe?: number;
    rpeMax?: number;
}
export type FocusField = 'weight' | 'intensity' | 'rpe';
/**
 * Sincronizza i valori tra weight, intensity e RPE
 * Il campo in focus è il "master" e gli altri vengono calcolati
 *
 * @param focusField - Campo che l'utente sta modificando
 * @param values - Valori correnti
 * @param oneRepMax - 1RM per i calcoli
 * @param reps - Reps per calcolo RPE (opzionale)
 * @param weightIncrement - Plate increment for rounding weights (optional, default 2.5)
 */
export declare function syncSetValues(focusField: FocusField, values: {
    weight?: number | null;
    weightMax?: number | null;
    intensityPercent?: number | null;
    intensityPercentMax?: number | null;
    rpe?: number | null;
    rpeMax?: number | null;
}, oneRepMax?: number, reps?: number, weightIncrement?: number): SyncedValues;
//# sourceMappingURL=intensity-calculator.d.ts.map