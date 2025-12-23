/**
 * Workout Service
 *
 * CRUD operations per workout programs
 * Implementa IWorkoutService contract
 */
import {  createId, getCurrentTimestamp, storageService  } from '@onecoach/lib-shared';
/**
 * Storage key per workouts
 */
const WORKOUTS_KEY = 'workouts';
/**
 * Implementazione Workout Service
 */
export class WorkoutService {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    create(workout) {
        try {
            const now = getCurrentTimestamp();
            const newWorkout = {
                ...workout,
                id: createId(),
                createdAt: now,
                updatedAt: now,
            };
            const workouts = this.getAllWorkouts();
            workouts.push(newWorkout);
            this.storage.set(WORKOUTS_KEY, workouts);
            return {
                success: true,
                data: newWorkout,
                message: 'Workout program created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create workout',
            };
        }
    }
    update(id, workout) {
        try {
            const workouts = this.getAllWorkouts();
            const index = workouts.findIndex((w) => w.id === id);
            if (index === -1) {
                return {
                    success: false,
                    error: 'Workout program not found',
                };
            }
            const existingWorkout = workouts[index];
            if (!existingWorkout) {
                return {
                    success: false,
                    error: 'Workout program not found',
                };
            }
            const updatedWorkout = {
                ...existingWorkout,
                ...workout,
                name: workout.name ?? existingWorkout.name,
                id,
                createdAt: existingWorkout.createdAt,
                updatedAt: getCurrentTimestamp(),
            };
            workouts[index] = updatedWorkout;
            this.storage.set(WORKOUTS_KEY, workouts);
            return {
                success: true,
                data: updatedWorkout,
                message: 'Workout program updated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update workout',
            };
        }
    }
    delete(id) {
        try {
            const workouts = this.getAllWorkouts();
            const filteredWorkouts = workouts.filter((w) => w.id !== id);
            if (workouts.length === filteredWorkouts.length) {
                return {
                    success: false,
                    error: 'Workout program not found',
                };
            }
            this.storage.set(WORKOUTS_KEY, filteredWorkouts);
            return {
                success: true,
                message: 'Workout program deleted successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete workout',
            };
        }
    }
    get(id) {
        try {
            const workouts = this.getAllWorkouts();
            const workout = workouts.find((w) => w.id === id);
            if (!workout) {
                return {
                    success: false,
                    error: 'Workout program not found',
                };
            }
            return {
                success: true,
                data: workout,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get workout',
            };
        }
    }
    getAll() {
        try {
            const workouts = this.getAllWorkouts();
            return {
                success: true,
                data: workouts,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get workouts',
            };
        }
    }
    getByStatus(status) {
        try {
            const workouts = this.getAllWorkouts();
            const filtered = workouts.filter((w) => w.status === status);
            return {
                success: true,
                data: filtered,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get workouts by status',
            };
        }
    }
    getAllWorkouts() {
        return this.storage.get(WORKOUTS_KEY) || [];
    }
}
/**
 * Singleton instance
 */
export const workoutService = new WorkoutService(storageService);
