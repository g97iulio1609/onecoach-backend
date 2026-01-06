export interface VerificationResult {
    valid: boolean;
    subscription?: {
        productId: string;
        originalTransactionId: string;
        purchaseDate: number;
        expirationDate: number;
        isInTrial: boolean;
        willAutoRenew: boolean;
        isCancelled: boolean;
    };
    error?: string;
}
/**
 * Verify Apple App Store receipt
 * Uses Apple's verifyReceipt API
 */
export declare function verifyAppleReceipt(receiptData: string): Promise<VerificationResult>;
/**
 * Verify Google Play purchase
 * Uses Google Play Developer API
 */
export declare function verifyGoogleReceipt(productId: string, purchaseToken: string): Promise<VerificationResult>;
//# sourceMappingURL=iap-verification.server.d.ts.map