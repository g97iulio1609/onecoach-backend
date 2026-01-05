type OnboardingProfileInput = {
    name?: string;
    age?: number;
    sex?: 'MALE' | 'FEMALE' | 'OTHER';
    heightCm?: number;
    weightKg?: number;
};
export declare function saveOnboardingProfile(userId: string, profileData: OnboardingProfileInput): Promise<void>;
export {};
