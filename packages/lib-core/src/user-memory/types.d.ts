export type MemoryDomain = 'workout' | 'nutrition' | 'oneagenda' | 'projects' | 'tasks' | 'habits' | 'general';
/**
 * User Memory Types
 *
 * TypeScript types for the dynamic user memory system.
 * Memory is structured by domain (workout, nutrition, oneagenda, etc.)
 * with preferences, patterns, history, and insights for each domain.
 */
/**
 * Base structure for domain-specific memory
 */
export interface DomainMemory {
    preferences: Record<string, unknown>;
    patterns: MemoryPattern[];
    history: MemoryHistoryItem[];
    insights: MemoryInsight[];
    lastUpdated: string;
}
/**
 * Memory pattern identified from user behavior
 */
export interface MemoryPattern {
    type: string;
    description: string;
    confidence: number;
    evidence: string[];
    firstObserved: string;
    lastObserved: string;
    frequency: number;
    suggestions?: string[];
}
/**
 * Historical event/item stored in memory
 */
export interface MemoryHistoryItem {
    id: string;
    type: string;
    domain: string;
    timestamp: string;
    data: Record<string, unknown>;
    metadata?: {
        source?: string;
        importance?: number;
    };
}
/**
 * Insight extracted from patterns and history
 */
export interface MemoryInsight {
    id: string;
    category: string;
    insight: string;
    basedOn: string;
    confidence: number;
    relevance: number;
    generatedAt: string;
    expiresAt?: string;
}
/**
 * Workout domain memory
 */
export interface WorkoutMemory extends DomainMemory {
    preferences: {
        preferredSplitTypes?: string[];
        preferredDaysPerWeek?: number;
        preferredDurationWeeks?: number;
        preferredDifficulty?: string;
        favoriteExercises?: string[];
        avoidedExercises?: string[];
        preferredEquipment?: string[];
        workoutTiming?: {
            preferredDays?: string[];
            preferredTimes?: string[];
        };
    };
    patterns: Array<MemoryPattern & {
        type: 'WORKOUT_FREQUENCY' | 'SPLIT_PREFERENCE' | 'EXERCISE_PREFERENCE' | 'PROGRESSION_PATTERN';
    }>;
    history: Array<MemoryHistoryItem & {
        type: 'PROGRAM_CREATED' | 'PROGRAM_COMPLETED' | 'SESSION_LOGGED' | 'FEEDBACK_GIVEN';
    }>;
}
/**
 * Nutrition domain memory
 */
export interface NutritionMemory extends DomainMemory {
    preferences: {
        preferredMealsPerDay?: number;
        preferredMealTiming?: Record<string, string>;
        favoriteFoods?: string[];
        avoidedFoods?: string[];
        dietaryRestrictions?: string[];
        dietaryPreferences?: string[];
        macroPreferences?: {
            proteinRatio?: number;
            carbRatio?: number;
            fatRatio?: number;
        };
    };
    patterns: Array<MemoryPattern & {
        type: 'MEAL_TIMING' | 'FOOD_PREFERENCE' | 'MACRO_PATTERN' | 'ADHERENCE_PATTERN';
    }>;
    history: Array<MemoryHistoryItem & {
        type: 'PLAN_CREATED' | 'PLAN_COMPLETED' | 'MEAL_LOGGED' | 'FEEDBACK_GIVEN';
    }>;
}
/**
 * OneAgenda domain memory (projects, tasks, habits)
 */
export interface OneAgendaMemory extends DomainMemory {
    preferences: {
        preferredTaskPriorities?: string[];
        preferredProjectStructure?: Record<string, unknown>;
        habitFrequency?: Record<string, string>;
        workRhythm?: {
            peakHours?: string[];
            lowEnergyHours?: string[];
        };
    };
    patterns: Array<MemoryPattern & {
        type: 'WORK_RHYTHM' | 'PRIORITY_PREFERENCE' | 'TASK_TIMING' | 'GOAL_SETTING' | 'HABIT_PATTERN';
    }>;
    history: Array<MemoryHistoryItem & {
        type: 'TASK_CREATED' | 'TASK_COMPLETED' | 'PROJECT_CREATED' | 'HABIT_LOGGED' | 'HABIT_STREAK';
    }>;
}
/**
 * Projects domain memory
 */
export interface ProjectsMemory extends DomainMemory {
    preferences: {
        preferredProjectTypes?: string[];
        preferredMilestoneStructure?: Record<string, unknown>;
        projectTiming?: {
            preferredDurations?: string[];
            preferredStartDays?: string[];
        };
    };
    patterns: Array<MemoryPattern & {
        type: 'PROJECT_PATTERN' | 'MILESTONE_PATTERN' | 'COMPLETION_PATTERN';
    }>;
    history: Array<MemoryHistoryItem & {
        type: 'PROJECT_CREATED' | 'PROJECT_COMPLETED' | 'MILESTONE_REACHED';
    }>;
}
/**
 * Tasks domain memory
 */
export interface TasksMemory extends DomainMemory {
    preferences: {
        preferredTaskStructure?: Record<string, unknown>;
        taskTiming?: {
            preferredDays?: string[];
            preferredTimes?: string[];
        };
    };
    patterns: Array<MemoryPattern & {
        type: 'TASK_PATTERN' | 'COMPLETION_PATTERN' | 'PRIORITY_PATTERN';
    }>;
    history: Array<MemoryHistoryItem & {
        type: 'TASK_CREATED' | 'TASK_COMPLETED' | 'TASK_UPDATED';
    }>;
}
/**
 * Habits domain memory
 */
export interface HabitsMemory extends DomainMemory {
    preferences: {
        preferredHabitTypes?: string[];
        preferredFrequencies?: string[];
        habitTiming?: Record<string, string>;
    };
    patterns: Array<MemoryPattern & {
        type: 'HABIT_PATTERN' | 'STREAK_PATTERN' | 'COMPLETION_PATTERN';
    }>;
    history: Array<MemoryHistoryItem & {
        type: 'HABIT_CREATED' | 'HABIT_LOGGED' | 'STREAK_ACHIEVED' | 'HABIT_ARCHIVED';
    }>;
}
/**
 * General/user-level memory
 */
export interface GeneralMemory extends DomainMemory {
    preferences: {
        communicationStyle?: string;
        preferredLanguage?: string;
        timezone?: string;
        notificationPreferences?: Record<string, boolean>;
    };
    patterns: Array<MemoryPattern & {
        type: 'COMMUNICATION_PATTERN' | 'USAGE_PATTERN' | 'PREFERENCE_PATTERN';
    }>;
    history: Array<MemoryHistoryItem & {
        type: 'INTERACTION' | 'FEEDBACK' | 'PREFERENCE_CHANGE';
    }>;
}
/**
 * Complete user memory structure
 */
export type UserMemory = Partial<Record<MemoryDomain, DomainMemory>>;
/**
 * Memory update payload for a specific domain
 */
export interface MemoryUpdate {
    domain: keyof UserMemory;
    updates: {
        preferences?: Partial<DomainMemory['preferences']>;
        patterns?: MemoryPattern[];
        history?: MemoryHistoryItem[];
        insights?: MemoryInsight[];
    };
}
/**
 * Memory context for AI agents
 */
export interface MemoryContext {
    userId: string;
    memory: UserMemory;
    relevantPatterns: MemoryPattern[];
    relevantInsights: MemoryInsight[];
    recommendations: Array<{
        type: string;
        message: string;
        priority: number;
    }>;
}
/**
 * Domain names for type safety
 */
/**
 * Options for memory retrieval
 */
export interface GetMemoryOptions {
    domain?: MemoryDomain;
    includeHistory?: boolean;
    includePatterns?: boolean;
    includeInsights?: boolean;
    historyLimit?: number;
    patternConfidenceThreshold?: number;
}
/**
 * Options for memory analysis
 */
export interface AnalyzeMemoryOptions {
    domain?: MemoryDomain;
    timeframe?: {
        start: string;
        end: string;
    };
    focusAreas?: string[];
}
/**
 * Memory version snapshot
 */
export interface MemoryVersion {
    id: string;
    userId: string;
    versionNumber: number;
    memory: UserMemory;
    changeType: 'manual' | 'auto' | 'enhanced';
    changeNote?: string;
    changedBy?: 'user' | 'ai' | 'system';
    createdAt: string;
}
/**
 * Version diff for comparison
 */
export interface MemoryVersionDiff {
    version1: MemoryVersion;
    version2: MemoryVersion;
    changes: Array<{
        domain: MemoryDomain;
        field: string;
        oldValue: unknown;
        newValue: unknown;
        changeType: 'added' | 'removed' | 'modified';
    }>;
}
/**
 * Timeline event type
 */
export type TimelineEventType = 'progress' | 'injury' | 'goal' | 'milestone' | 'note';
/**
 * Timeline event
 */
export interface TimelineEvent {
    id: string;
    userId: string;
    eventType: TimelineEventType;
    domain?: MemoryDomain;
    title: string;
    description?: string;
    data?: Record<string, unknown>;
    date: string;
    createdAt: string;
}
/**
 * Progress event data
 */
export interface ProgressEventData {
    type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'strength_increase' | 'endurance_improvement';
    value: number;
    unit: string;
    previousValue?: number;
    period: string;
}
/**
 * Injury event data
 */
export interface InjuryEventData {
    bodyPart: string;
    severity: 'mild' | 'moderate' | 'severe';
    recoveryStatus: 'recovering' | 'recovered' | 'chronic';
    recoveryDate?: string;
    notes?: string;
}
/**
 * Goal event data
 */
export interface GoalEventData {
    goalId?: string;
    goalType: string;
    status: 'completed' | 'failed' | 'in_progress' | 'behind_schedule';
    completionDate?: string;
    targetDate?: string;
    progress?: number;
}
