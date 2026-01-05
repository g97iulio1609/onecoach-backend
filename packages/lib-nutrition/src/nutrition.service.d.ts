/**
 * Nutrition Service
 *
 * CRUD operations per nutrition plans
 * Implementa INutritionService contract
 */
import type { NutritionPlan, ApiResponse } from '@onecoach/types';
import type { INutritionService } from '@onecoach/contracts';
import type { IStorageService } from '@onecoach/lib-shared';
/**
 * Implementazione Nutrition Service
 */
export declare class NutritionService implements INutritionService {
    private storage;
    constructor(storage: IStorageService);
    /**
     * Crea un nuovo nutrition plan
     */
    create(plan: Omit<NutritionPlan, 'id' | 'createdAt' | 'updatedAt'>): ApiResponse<NutritionPlan>;
    /**
     * Aggiorna un nutrition plan
     */
    update(id: string, plan: Partial<NutritionPlan>): ApiResponse<NutritionPlan>;
    /**
     * Elimina un nutrition plan
     */
    delete(id: string): ApiResponse<void>;
    /**
     * Ottiene un nutrition plan per id
     */
    get(id: string): ApiResponse<NutritionPlan>;
    /**
     * Ottiene tutti i nutrition plans
     */
    getAll(): ApiResponse<NutritionPlan[]>;
    /**
     * Ottiene nutrition plans per goal
     */
    getByGoal(goalId: string): ApiResponse<NutritionPlan[]>;
    /**
     * Ottiene un nutrition plan creato da un planId di planning (metadata.planId)
     */
    getByPlanId(planId: string): ApiResponse<NutritionPlan | null>;
    /**
     * Helper per ottenere tutti i plans dallo storage
     */
    private getAllPlans;
}
/**
 * Singleton instance
 */
export declare const nutritionService: INutritionService;
//# sourceMappingURL=nutrition.service.d.ts.map