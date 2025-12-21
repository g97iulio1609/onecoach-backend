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
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/client").DefaultArgs>;
export declare function disconnectPrisma(): Promise<void>;
