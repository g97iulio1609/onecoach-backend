/**
 * Nutrition Service
 *
 * CRUD operations per nutrition plans
 * Implementa INutritionService contract
 */
import { generateId, getCurrentTimestamp, storageService } from '@onecoach/lib-shared';
/**
 * Storage key per nutrition plans
 */
const NUTRITION_KEY = 'nutrition_plans';
/**
 * Implementazione Nutrition Service
 */
export class NutritionService {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Crea un nuovo nutrition plan
     */
    create(plan) {
        try {
            const now = getCurrentTimestamp();
            const newPlan = {
                ...plan,
                id: generateId('nutrition'),
                createdAt: now,
                updatedAt: now,
                status: plan.status ?? 'DRAFT',
                version: plan.version ?? 1,
                metadata: plan.metadata ?? {},
                weeks: plan.weeks ?? [],
                goals: plan.goals ?? [],
            };
            const plans = this.getAllPlans();
            plans.push(newPlan);
            this.storage.set(NUTRITION_KEY, plans);
            return {
                success: true,
                data: newPlan,
                message: 'Nutrition plan created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create nutrition plan',
            };
        }
    }
    /**
     * Aggiorna un nutrition plan
     */
    update(id, plan) {
        try {
            const plans = this.getAllPlans();
            const index = plans.findIndex((p) => p.id === id);
            if (index === -1) {
                return {
                    success: false,
                    error: 'Nutrition plan not found',
                };
            }
            const existingPlan = plans[index];
            if (!existingPlan) {
                return {
                    success: false,
                    error: 'Nutrition plan not found',
                };
            }
            const updatedPlan = {
                ...existingPlan,
                ...plan,
                name: plan.name ?? existingPlan.name,
                id,
                createdAt: existingPlan.createdAt,
                updatedAt: getCurrentTimestamp(),
            };
            plans[index] = updatedPlan;
            this.storage.set(NUTRITION_KEY, plans);
            return {
                success: true,
                data: updatedPlan,
                message: 'Nutrition plan updated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update nutrition plan',
            };
        }
    }
    /**
     * Elimina un nutrition plan
     */
    delete(id) {
        try {
            const plans = this.getAllPlans();
            const filteredPlans = plans.filter((p) => p.id !== id);
            if (plans.length === filteredPlans.length) {
                return {
                    success: false,
                    error: 'Nutrition plan not found',
                };
            }
            this.storage.set(NUTRITION_KEY, filteredPlans);
            return {
                success: true,
                message: 'Nutrition plan deleted successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete nutrition plan',
            };
        }
    }
    /**
     * Ottiene un nutrition plan per id
     */
    get(id) {
        try {
            const plans = this.getAllPlans();
            const plan = plans.find((p) => p.id === id);
            if (!plan) {
                return {
                    success: false,
                    error: 'Nutrition plan not found',
                };
            }
            return {
                success: true,
                data: plan,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get nutrition plan',
            };
        }
    }
    /**
     * Ottiene tutti i nutrition plans
     */
    getAll() {
        try {
            const plans = this.getAllPlans();
            return {
                success: true,
                data: plans,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get nutrition plans',
            };
        }
    }
    /**
     * Ottiene nutrition plans per goal
     */
    getByGoal(goalId) {
        try {
            const plans = this.getAllPlans();
            const filtered = plans.filter((p) => p.goals && p.goals.includes(goalId));
            return {
                success: true,
                data: filtered,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get nutrition plans by goal',
            };
        }
    }
    /**
     * Ottiene un nutrition plan creato da un planId di planning (metadata.planId)
     */
    getByPlanId(planId) {
        try {
            const plans = this.getAllPlans();
            const plan = plans.find((p) => p.metadata?.planId === planId) || null;
            return { success: true, data: plan };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get nutrition plan by planId',
            };
        }
    }
    /**
     * Helper per ottenere tutti i plans dallo storage
     */
    getAllPlans() {
        return this.storage.get(NUTRITION_KEY) || [];
    }
}
/**
 * Singleton instance
 */
export const nutritionService = new NutritionService(storageService);
