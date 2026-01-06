/**
 * User Memory Event Listeners
 *
 * Listener functions that update user memory based on events from various domains.
 * These are called directly from MCP tools, API routes, and other services.
 */
import { userMemoryService } from '../user-memory.service';
import { logger } from '@onecoach/lib-shared/utils/logger';
// ============================================================================
// WORKOUT EVENT LISTENERS
// ============================================================================
/**
 * Handle workout program created event
 */
export async function handleWorkoutProgramCreated(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'workout',
        timestamp: new Date().toISOString(),
        data: {
            programId: event.data.programId,
            programName: event.data.programName,
            goal: event.data.goal,
            durationWeeks: event.data.durationWeeks,
            daysPerWeek: event.data.daysPerWeek,
            splitType: event.data.splitType,
        },
        metadata: {
            source: 'workout_tool',
            importance: 0.8,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'workout', historyItem);
    // Update preferences based on created program
    if (event.data.goal) {
        await userMemoryService.updatePreferences(event.userId, 'workout', {
            preferredGoals: [event.data.goal],
        });
    }
    if (event.data.splitType) {
        await userMemoryService.updatePreferences(event.userId, 'workout', {
            preferredSplitTypes: [event.data.splitType],
        });
    }
    if (event.data.daysPerWeek) {
        await userMemoryService.updatePreferences(event.userId, 'workout', {
            preferredDaysPerWeek: event.data.daysPerWeek,
        });
    }
}
/**
 * Handle workout program completed event
 */
export async function handleWorkoutProgramCompleted(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'workout',
        timestamp: new Date().toISOString(),
        data: {
            programId: event.data.programId,
            programName: event.data.programName,
        },
        metadata: {
            source: 'workout_tool',
            importance: 0.9,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'workout', historyItem);
}
/**
 * Handle workout feedback event
 */
export async function handleWorkoutFeedback(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'workout',
        timestamp: new Date().toISOString(),
        data: {
            programId: event.data.programId,
            feedback: event.data.feedback,
            rating: event.data.rating,
        },
        metadata: {
            source: 'user_feedback',
            importance: 0.7,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'workout', historyItem);
}
// ============================================================================
// NUTRITION EVENT LISTENERS
// ============================================================================
/**
 * Handle nutrition plan created event
 */
export async function handleNutritionPlanCreated(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'nutrition',
        timestamp: new Date().toISOString(),
        data: {
            planId: event.data.planId,
            planName: event.data.planName,
            goal: event.data.goal,
            durationWeeks: event.data.durationWeeks,
            mealsPerDay: event.data.mealsPerDay,
        },
        metadata: {
            source: 'nutrition_tool',
            importance: 0.8,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'nutrition', historyItem);
    // Update preferences
    if (event.data.goal) {
        await userMemoryService.updatePreferences(event.userId, 'nutrition', {
            preferredGoals: [event.data.goal],
        });
    }
    if (event.data.mealsPerDay) {
        await userMemoryService.updatePreferences(event.userId, 'nutrition', {
            preferredMealsPerDay: event.data.mealsPerDay,
        });
    }
}
/**
 * Handle nutrition plan completed event
 */
export async function handleNutritionPlanCompleted(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'nutrition',
        timestamp: new Date().toISOString(),
        data: {
            planId: event.data.planId,
            planName: event.data.planName,
        },
        metadata: {
            source: 'nutrition_tool',
            importance: 0.9,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'nutrition', historyItem);
}
/**
 * Handle nutrition feedback event
 */
export async function handleNutritionFeedback(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'nutrition',
        timestamp: new Date().toISOString(),
        data: {
            planId: event.data.planId,
            feedback: event.data.feedback,
            rating: event.data.rating,
        },
        metadata: {
            source: 'user_feedback',
            importance: 0.7,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'nutrition', historyItem);
}
// ============================================================================
// ONEAGENDA EVENT LISTENERS
// ============================================================================
/**
 * Handle task created/completed event
 */
export async function handleTaskEvent(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'oneagenda',
        timestamp: new Date().toISOString(),
        data: {
            taskId: event.data.taskId,
            priority: event.data.priority,
            status: event.data.status,
        },
        metadata: {
            source: 'oneagenda_tool',
            importance: event.type === 'TASK_COMPLETED' ? 0.6 : 0.4,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'oneagenda', historyItem);
    // Update preferences based on priority patterns
    if (event.data.priority) {
        const memory = await userMemoryService.getMemory(event.userId, {
            domain: 'oneagenda',
        });
        const currentPriorities = memory.oneagenda?.preferences.preferredTaskPriorities || [];
        if (!currentPriorities.includes(event.data.priority)) {
            await userMemoryService.updatePreferences(event.userId, 'oneagenda', {
                preferredTaskPriorities: [...currentPriorities, event.data.priority],
            });
        }
    }
}
/**
 * Handle habit logged event
 */
export async function handleHabitLogged(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'oneagenda',
        timestamp: new Date().toISOString(),
        data: {
            habitId: event.data.habitId,
            streak: event.data.streak,
        },
        metadata: {
            source: 'oneagenda_tool',
            importance: 0.5,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'oneagenda', historyItem);
}
/**
 * Handle project created event
 */
export async function handleProjectCreated(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'oneagenda',
        timestamp: new Date().toISOString(),
        data: {
            projectId: event.data.projectId,
        },
        metadata: {
            source: 'oneagenda_tool',
            importance: 0.6,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'oneagenda', historyItem);
}
// ============================================================================
// CHAT EVENT LISTENERS
// ============================================================================
/**
 * Handle chat interaction event
 */
export async function handleChatInteraction(event) {
    const historyItem = {
        id: '',
        type: event.type,
        domain: 'general',
        timestamp: new Date().toISOString(),
        data: {
            message: event.data.message,
            intent: event.data.intent,
        },
        metadata: {
            source: 'chat',
            importance: 0.3,
        },
    };
    await userMemoryService.addHistoryItem(event.userId, 'general', historyItem);
}
/**
 * Handle preference change event
 */
export async function handlePreferenceChange(event) {
    if (event.data.preference && event.data.value !== undefined) {
        // Determine domain from preference name
        let domain = 'general';
        if (event.data.preference.includes('workout') || event.data.preference.includes('exercise')) {
            domain = 'workout';
        }
        else if (event.data.preference.includes('nutrition') ||
            event.data.preference.includes('meal') ||
            event.data.preference.includes('food')) {
            domain = 'nutrition';
        }
        await userMemoryService.updatePreferences(event.userId, domain, {
            [event.data.preference]: event.data.value,
        });
    }
}
// ============================================================================
// UNIFIED EVENT HANDLER
// ============================================================================
/**
 * Unified event handler that routes events to appropriate listeners
 */
export async function handleMemoryEvent(event) {
    try {
        if ('type' in event) {
            switch (event.type) {
                // Workout events
                case 'PROGRAM_CREATED':
                    await handleWorkoutProgramCreated(event);
                    break;
                case 'PROGRAM_COMPLETED':
                    await handleWorkoutProgramCompleted(event);
                    break;
                case 'FEEDBACK_GIVEN':
                    if ('programId' in event.data) {
                        await handleWorkoutFeedback(event);
                    }
                    else if ('planId' in event.data) {
                        await handleNutritionFeedback(event);
                    }
                    break;
                // Nutrition events
                case 'PLAN_CREATED':
                    await handleNutritionPlanCreated(event);
                    break;
                case 'PLAN_COMPLETED':
                    await handleNutritionPlanCompleted(event);
                    break;
                // OneAgenda events
                case 'TASK_CREATED':
                case 'TASK_COMPLETED':
                    await handleTaskEvent(event);
                    break;
                case 'HABIT_LOGGED':
                case 'HABIT_STREAK':
                    await handleHabitLogged(event);
                    break;
                case 'PROJECT_CREATED':
                    await handleProjectCreated(event);
                    break;
                // Chat events
                case 'INTERACTION':
                    await handleChatInteraction(event);
                    break;
                case 'PREFERENCE_CHANGE':
                    await handlePreferenceChange(event);
                    break;
                default:
                    logger.warn('[Memory] Unknown event type:', { type: event.type });
            }
        }
    }
    catch (error) {
        logger.error('[Memory] Error handling event:', error);
        // Don't throw - memory updates should not break main flow
    }
}
