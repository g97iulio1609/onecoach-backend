export declare class PayoutProfileService {
    static getProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        notes: string | null;
        beneficiaryName: string;
        taxCode: string | null;
        vatNumber: string | null;
        iban: string | null;
        bicSwift: string | null;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        postalCode: string | null;
        country: string | null;
        taxResidence: string | null;
    } | null>;
    static upsertProfile(userId: string, data: {
        beneficiaryName: string;
        taxCode?: string | null;
        vatNumber?: string | null;
        iban?: string | null;
        bicSwift?: string | null;
        addressLine1?: string | null;
        addressLine2?: string | null;
        city?: string | null;
        postalCode?: string | null;
        country?: string | null;
        taxResidence?: string | null;
        notes?: string | null;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        notes: string | null;
        beneficiaryName: string;
        taxCode: string | null;
        vatNumber: string | null;
        iban: string | null;
        bicSwift: string | null;
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        postalCode: string | null;
        country: string | null;
        taxResidence: string | null;
    }>;
}
//# sourceMappingURL=payout-profile.service.d.ts.map