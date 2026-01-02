/**
 * useLiveSessionSync Hook
 *
 * Syncs live workout session state with the CopilotActiveContext store.
 * Use this hook in any live workout execution component to enable
 * AI coaching features.
 *
 * USAGE:
 * ```tsx
 * function LiveWorkoutScreen({ sessionId, programId }) {
 *   const { isReady, setCurrentExercise, recordSet, updateTimer } = useLiveSessionSync({
 *     sessionId,
 *     programId,
 *     totalSets: calculateTotalSets(program),
 *   });
 *
 *   // When user advances to next exercise
 *   setCurrentExercise('Squat', 0);
 *
 *   // When user completes a set
 *   recordSet({ weight: 100, reps: 8, rpe: 7 });
 *
 *   // Timer updates
 *   updateTimer(true, 90);
 * }
 * ```
 */
export interface UseLiveSessionSyncOptions {
    sessionId: string;
    programId: string;
    totalSets: number;
    autoInitialize?: boolean;
}
export interface LiveSessionSetData {
    weight: number;
    reps: number;
    rpe?: number | null;
    duration?: number;
}
export declare function useLiveSessionSync(options: UseLiveSessionSyncOptions): {
    isReady: boolean;
    session: import("..").LiveSessionContext | null;
    progress: {
        completed: number;
        total: number;
        percentage: number;
    } | null;
    currentExercise: string | null;
    lastSet: {
        weight: number;
        reps: number;
        rpe: number | null;
        duration: number;
    } | null;
    restTimer: {
        running: boolean;
        remaining: number;
    } | null;
    status: "active" | "completed" | "paused" | null;
    setProgress: (exerciseIndex: number, setIndex: number, completedSets: number) => void;
    setCurrentExercise: (exerciseName: string | null, exerciseIndex: number) => void;
    recordSet: (setData: LiveSessionSetData) => void;
    updateTimer: (running: boolean, secondsRemaining: number) => void;
    pauseSession: () => void;
    resumeSession: () => void;
    completeSession: () => void;
    endSession: () => void;
};
export default useLiveSessionSync;
//# sourceMappingURL=useLiveSessionSync.d.ts.map