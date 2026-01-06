/**
 * Prisma Client Singleton
 *
 * Prevents multiple instances of Prisma Client during Next.js hot reload
 * Lazy initialization to avoid Prisma 7.0.0 constructor issues
 *
 * This file is server-only and should never be imported in client components.
 * Use dynamic imports when needed in server-side code that may be bundled with client code.
 */
import { PrismaClient } from '@prisma/client';
/**
 * Get the singleton PrismaClient instance.
 * Creates the client on first call, then reuses it.
 */
export declare function getPrisma(): PrismaClient;
/**
 * Prisma client getter - LAZY initialization.
 * Uses a getter function to defer client creation until first access.
 *
 * @example
 * import { prisma } from '@onecoach/lib-core';
 * const users = await prisma.users.findMany(); // Client created here
 */
export declare const prisma: PrismaClient;
export declare function disconnectPrisma(): Promise<void>;
export { Prisma } from '@prisma/client';
export type { PrismaClient } from '@prisma/client';
//# sourceMappingURL=prisma.d.ts.map