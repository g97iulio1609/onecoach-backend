/**
 * Workout Summary Normalizer
 *
 * Normalizer leggero per le liste di programmi.
 * NON parsa il campo `weeks` JSON per evitare overhead.
 */
import { DifficultyLevel, WorkoutStatus } from '@onecoach/types/client';
/**
 * Tipo ridotto per la lista programmi (senza weeks)
 */
export interface WorkoutProgramSummary {
    id: string;
    name: string;
    description: string;
    difficulty: DifficultyLevel;
    durationWeeks: number;
    goals: string[];
    status: WorkoutStatus;
    createdAt: string;
    updatedAt: string;
    userId?: string;
}
/**
 * Tipo minimo Prisma per summary (ottimizzato con select)
 */
export interface PrismaWorkoutProgramSummary {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    durationWeeks: number;
    goals: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
    userId?: string | null;
}
/**
 * Normalizza un programma per la visualizzazione in lista.
 * NON effettua parsing del campo weeks per performance ottimale.
 */
export declare function normalizeWorkoutProgramSummary(program: PrismaWorkoutProgramSummary): WorkoutProgramSummary;
//# sourceMappingURL=workout-summary-normalizer.d.ts.map