/**
 * Workout Constants
 *
 * Constants condivise per workout programs
 */
import type { ExerciseSet, MuscleGroup } from '@onecoach/types';
/**
 * Default values per ExerciseSet
 * Tutti i campi required sono presenti anche se null (per allineamento con tipo)
 */
export declare const DEFAULT_SET: ExerciseSet;
/**
 * Categorie esercizio consentite
 */
export declare const ALLOWED_CATEGORIES: Set<string>;
/**
 * Gruppi muscolari consentiti
 */
export declare const ALLOWED_MUSCLE_GROUPS: Set<MuscleGroup>;
/**
 * Alias per mappare nomi di gruppi muscolari a valori standard
 * Consolidato per eliminare duplicazioni (Area 3 refactoring)
 */
export declare const MUSCLE_GROUP_ALIASES: Record<string, MuscleGroup>;
