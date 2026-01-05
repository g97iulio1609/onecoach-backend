/**
 * Onboarding Store
 *
 * Manages onboarding progress and wizard state
 * Replaces OnboardingContext with a simpler solution
 */
'use client';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
/**
 * Initial state
 */
const initialState = {
    progress: null,
    isLoading: false,
    error: null,
    isWizardOpen: false,
};
/**
 * Onboarding Store
 *
 * Note: The actual API calls should be handled by TanStack Query
 * This store only manages the UI state and progress data
 */
export const useOnboardingStore = create()(devtools((set) => ({
    ...initialState,
    setProgress: (progress) => set({ progress }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setWizardOpen: (isWizardOpen) => set({ isWizardOpen }),
    toggleWizard: () => set((state) => ({
        isWizardOpen: !state.isWizardOpen,
    })),
    completeStep: (stepNumber, _metadata) => set((state) => {
        if (!state.progress)
            return state;
        return {
            progress: {
                ...state.progress,
                currentStep: stepNumber + 1,
                completedSteps: {
                    ...state.progress.completedSteps,
                    [stepNumber]: true,
                },
                // We might need to update other fields like lastInteraction
            },
        };
    }),
    skipStep: (stepNumber) => set((state) => {
        if (!state.progress)
            return state;
        return {
            progress: {
                ...state.progress,
                currentStep: stepNumber + 1,
                skippedSteps: {
                    ...state.progress.skippedSteps,
                    [stepNumber]: true,
                },
            },
        };
    }),
    goToStep: (stepNumber) => set((state) => {
        if (!state.progress)
            return state;
        return {
            progress: {
                ...state.progress,
                currentStep: stepNumber,
            },
        };
    }),
    reset: () => set(initialState),
}), {
    name: 'OnboardingStore',
    enabled: process.env.NODE_ENV === 'development',
}));
