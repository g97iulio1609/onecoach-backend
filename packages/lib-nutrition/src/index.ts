/**
 * @onecoach/lib-nutrition
 *
 * Servizi per il dominio nutrizione
 * Implementa contratti da @onecoach/contracts
 */

export * from './nutrition.service';
export * from './nutrition-tracking.service';
export * from './nutrition-template.service';
export * from './nutrition-template-constants';
export * from './macro-validation.service';
export * from './meal-template.service';
export * from './modification.service';
export * from './helpers';
export * from './nutrition-import.service';

// Core domain logic (Pure functions, Calculators, Operations, Transformers)
export * from './core';

// Food auto-creation service
export * from './food-auto-creation.service';
