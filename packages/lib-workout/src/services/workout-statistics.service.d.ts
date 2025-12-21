import type { WorkoutProgram } from '@onecoach/types';
export interface WeeklyStats {
    week: number;
    volumeLoad: number;
    totalSets: number;
    totalLifts: number;
    avgIntensity: number;
    avgRpe: number;
}
export interface ExerciseStats {
    id: string;
    name: string;
    totalSets: number;
    totalReps: number;
    totalLifts: number;
    volumeLoad: number;
    avgIntensity: number;
    avgRpe: number;
    maxWeight: number;
    frequency: number;
}
export interface MuscleStats {
    name: string;
    sets: number;
    volumeLoad: number;
    totalLifts: number;
    frequency: number;
}
export interface WorkoutStatisticsResult {
    totalSets: number;
    totalVolumeLoad: number;
    totalLifts: number;
    avgIntensity: number;
    avgRpe: number;
    muscleChartData: MuscleStats[];
    weeklyStats: WeeklyStats[];
    exerciseStats: ExerciseStats[];
}
export declare class WorkoutStatisticsService {
    static calculate(program: WorkoutProgram): WorkoutStatisticsResult;
}
