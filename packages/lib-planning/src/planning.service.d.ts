/**
 * Planning Service v2 - Database Persistent
 *
 * Gestisce creazione e tracking di piani multi-task per generazione programmi complessi
 * con persistenza su database Supabase tramite Prisma.
 *
 * Features:
 * - Persistenza completa su database
 * - Checkpoint granulari (ogni subtask)
 * - Recovery automatico da crash
 * - Atomic updates con transactions
 * - Type-safe operations
 *
 * @version 2.0.0 - AI SDK v6 Integration
 */
import type { PlanningPlan, PlanningTask, PlanningSubTask, PlanningSubSubTask, PlanningProgress, PlanningPlanParams, TaskStatus } from '@onecoach/types';
/**
 * Planning Service v2
 * Gestisce piani di lavoro multi-task con persistenza database
 */
export declare class PlanningServiceV2 {
    /**
     * Crea un nuovo piano di lavoro persistente
     * Supporta struttura dinamica da metadata.structure invece di hardcoded
     */
    static createPlan(params: PlanningPlanParams & {
        userId: string;
    }): Promise<PlanningPlan>;
    /**
     * Ottiene un piano per ID con tutte le relations
     */
    static getPlan(planId: string): Promise<PlanningPlan>;
    /**
     * Ottiene progress di un piano
     */
    static getProgress(planId: string): Promise<PlanningProgress>;
    /**
     * Aggiorna stato di un task (week)
     * Atomic update con transaction
     */
    static updateTaskStatus(planId: string, weekNumber: number, status: TaskStatus, result?: unknown, error?: string): Promise<boolean>;
    /**
     * Aggiorna stato di un sub-task (day) con checkpoint
     * Atomic update con transaction
     */
    static updateSubTaskStatus(planId: string, weekNumber: number, dayNumber: number, status: TaskStatus, result?: unknown, error?: string): Promise<boolean>;
    /**
     * Ottiene prossimo task/subtask da eseguire
     */
    static getNextTask(planId: string): Promise<{
        task: PlanningTask;
        subTask: PlanningSubTask;
    } | null>;
    /**
     * Aggrega tutti i risultati in un programma completo
     */
    static aggregateResults(planId: string): Promise<unknown>;
    /**
     * Rimuove un piano (cleanup)
     */
    static removePlan(planId: string): Promise<boolean>;
    /**
     * Pause un piano (per controllo utente)
     */
    static pausePlan(planId: string): Promise<boolean>;
    /**
     * Resume un piano pausato
     */
    static resumePlan(planId: string): Promise<boolean>;
    /**
     * Cancel un piano
     */
    static cancelPlan(planId: string): Promise<boolean>;
    /**
     * Aggiorna metadata del piano effettuando un merge shallow
     */
    static setPlanMetadata(planId: string, patch: Record<string, unknown>): Promise<boolean>;
    /**
     * Ottiene tutti i piani di un utente
     */
    static getUserPlans(userId: string): Promise<PlanningPlan[]>;
    /**
     * Aggiorna stato piano basato su tasks
     * Da usare all'interno di una transaction
     */
    private static updatePlanStatusInTransaction;
    /**
     * Map database model to interface type
     */
    private static mapDbPlanToInterface;
    /**
     * Aggrega risultati workout
     */
    private static aggregateWorkoutResults;
    /**
     * Aggrega risultati nutrition
     */
    private static aggregateNutritionResults;
    /**
     * Crea sub-sub-task (pasti) per un sub-task (giorno) in una transaction
     * Usato durante la creazione del piano
     */
    private static createSubSubTasksInTransaction;
    /**
     * Aggiorna stato di un sub-sub-task (pasto)
     * Atomic update con transaction
     */
    static updateSubSubTaskStatus(planId: string, weekNumber: number, dayNumber: number, mealNumber: number, status: TaskStatus, result?: unknown, error?: string): Promise<boolean>;
    /**
     * Ottiene tutti i sub-sub-task (pasti) per un giorno specifico
     */
    static getSubSubTasks(planId: string, weekNumber: number, dayNumber: number): Promise<PlanningSubSubTask[]>;
    /**
     * Helper per nome giorno
     */
    private static getDayName;
}
//# sourceMappingURL=planning.service.d.ts.map