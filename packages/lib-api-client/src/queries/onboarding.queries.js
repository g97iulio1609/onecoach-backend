/**
 * Onboarding Query Keys and Functions
 *
 * Standardized query keys and query functions for onboarding queries
 */
/**
 * Query keys for onboarding queries
 */
export const onboardingKeys = {
    all: ['onboarding'],
    progress: () => [...onboardingKeys.all, 'progress'],
};
/**
 * Query functions for onboarding
 */
export const onboardingQueries = {
    /**
     * Get onboarding progress
     */
    getProgress: async () => {
        const response = await fetch('/api/onboarding');
        if (response.status === 401) {
            // User not authenticated, return default progress
            throw new Error('UNAUTHENTICATED');
        }
        if (!response.ok) {
            let errorMessage = 'Failed to fetch onboarding progress';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            }
            catch (_error) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        const data = (await response.json());
        if (!data.success || !data.progress) {
            throw new Error(data.error || 'Invalid response from onboarding API');
        }
        return data.progress;
    },
    /**
     * Complete a step
     */
    completeStep: async (payload) => {
        const response = await fetch('/api/onboarding/complete-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            let errorMessage = 'Failed to complete step';
            try {
                const errorData = await response.json();
                errorMessage =
                    errorData.error ||
                        errorData.message ||
                        errorData.details?.fieldErrors?.[0] ||
                        errorMessage;
            }
            catch (_error) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        const data = (await response.json());
        if (!data.success || !data.progress) {
            throw new Error(data.error || 'Invalid response from onboarding API');
        }
        return data.progress;
    },
    /**
     * Go to a specific step
     */
    goToStep: async (payload) => {
        const response = await fetch('/api/onboarding/go-to-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            let errorMessage = 'Failed to navigate to step';
            try {
                const errorData = await response.json();
                errorMessage =
                    errorData.error ||
                        errorData.message ||
                        errorData.details?.fieldErrors?.[0] ||
                        errorMessage;
            }
            catch (_error) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        const data = (await response.json());
        if (!data.success || !data.progress) {
            throw new Error(data.error || 'Invalid response from onboarding API');
        }
        return data.progress;
    },
    /**
     * Reset onboarding
     */
    reset: async () => {
        const response = await fetch('/api/onboarding/reset', {
            method: 'POST',
        });
        if (!response.ok) {
            let errorMessage = 'Failed to reset onboarding';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            }
            catch (error) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        const data = (await response.json());
        if (!data.success || !data.progress) {
            throw new Error(data.error || 'Invalid response from onboarding API');
        }
        return data.progress;
    },
    /**
     * Complete all steps
     */
    completeAll: async () => {
        const response = await fetch('/api/onboarding/complete-all', {
            method: 'POST',
        });
        if (!response.ok) {
            let errorMessage = 'Failed to complete all steps';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            }
            catch (error) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        const data = (await response.json());
        if (!data.success || !data.progress) {
            throw new Error(data.error || 'Invalid response from onboarding API');
        }
        return data.progress;
    },
};
