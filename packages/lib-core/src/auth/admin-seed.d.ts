/**
 * Admin seed utilities
 */
import { PrismaClient } from '@prisma/client';
export interface SeedAdminResult {
    admin: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        credits: number;
    } | null;
    created: boolean;
}
export interface SeedAdminsResult {
    admin: SeedAdminResult | null;
    superAdmin: SeedAdminResult | null;
}
export declare function ensureAdminUser(email: string): Promise<string>;
/**
 * Crea o aggiorna admin e super admin dalle variabili d'ambiente
 */
export declare function seedAdminsFromEnv(prismaClient: PrismaClient): Promise<SeedAdminsResult>;
declare const _default: {
    ensureAdminUser: typeof ensureAdminUser;
    seedAdminsFromEnv: typeof seedAdminsFromEnv;
};
export default _default;
//# sourceMappingURL=admin-seed.d.ts.map