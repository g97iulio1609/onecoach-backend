/**
 * User Memory Event Listeners
 *
 * Listener functions that update user memory based on events from various domains.
 * These are called directly from MCP tools, API routes, and other services.
 */
export interface WorkoutEvent {
    type: 'PROGRAM_CREATED' | 'PROGRAM_COMPLETED' | 'SESSION_LOGGED' | 'FEEDBACK_GIVEN';
    userId: string;
    data: {
        programId?: string;
        programName?: string;
        goal?: string;
        durationWeeks?: number;
        daysPerWeek?: number;
        splitType?: string;
        feedback?: string;
        rating?: number;
    };
}
export interface NutritionEvent {
    type: 'PLAN_CREATED' | 'PLAN_COMPLETED' | 'MEAL_LOGGED' | 'FEEDBACK_GIVEN';
    userId: string;
    data: {
        planId?: string;
        planName?: string;
        goal?: string;
        durationWeeks?: number;
        mealsPerDay?: number;
        feedback?: string;
        rating?: number;
    };
}
export interface OneAgendaEvent {
    type: 'TASK_CREATED' | 'TASK_COMPLETED' | 'PROJECT_CREATED' | 'HABIT_LOGGED' | 'HABIT_STREAK';
    userId: string;
    data: {
        taskId?: string;
        projectId?: string;
        habitId?: string;
        priority?: string;
        status?: string;
        streak?: number;
    };
}
export interface ChatEvent {
    type: 'INTERACTION' | 'FEEDBACK' | 'PREFERENCE_CHANGE';
    userId: string;
    data: {
        message?: string;
        intent?: string;
        feedback?: string;
        preference?: string;
        value?: unknown;
    };
}
/**
 * Handle workout program created event
 */
export declare function handleWorkoutProgramCreated(event: WorkoutEvent): Promise<void>;
/**
 * Handle workout program completed event
 */
export declare function handleWorkoutProgramCompleted(event: WorkoutEvent): Promise<void>;
/**
 * Handle workout feedback event
 */
export declare function handleWorkoutFeedback(event: WorkoutEvent): Promise<void>;
/**
 * Handle nutrition plan created event
 */
export declare function handleNutritionPlanCreated(event: NutritionEvent): Promise<void>;
/**
 * Handle nutrition plan completed event
 */
export declare function handleNutritionPlanCompleted(event: NutritionEvent): Promise<void>;
/**
 * Handle nutrition feedback event
 */
export declare function handleNutritionFeedback(event: NutritionEvent): Promise<void>;
/**
 * Handle task created/completed event
 */
export declare function handleTaskEvent(event: OneAgendaEvent): Promise<void>;
/**
 * Handle habit logged event
 */
export declare function handleHabitLogged(event: OneAgendaEvent): Promise<void>;
/**
 * Handle project created event
 */
export declare function handleProjectCreated(event: OneAgendaEvent): Promise<void>;
/**
 * Handle chat interaction event
 */
export declare function handleChatInteraction(event: ChatEvent): Promise<void>;
/**
 * Handle preference change event
 */
export declare function handlePreferenceChange(event: ChatEvent): Promise<void>;
/**
 * Unified event handler that routes events to appropriate listeners
 */
export declare function handleMemoryEvent(event: WorkoutEvent | NutritionEvent | OneAgendaEvent | ChatEvent): Promise<void>;
//# sourceMappingURL=listeners.d.ts.map