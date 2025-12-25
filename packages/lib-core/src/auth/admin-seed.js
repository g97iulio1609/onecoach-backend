/**
 * Admin seed utilities
 */
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createId } from '@onecoach/lib-shared/utils/id-generator';
import { prisma } from '../prisma';
import { logger } from '@onecoach/lib-core';
export async function ensureAdminUser(email) {
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing)
        return existing.id;
    const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);
    const user = await prisma.users.create({
        data: {
            email,
            password: hashedPassword,
            name: 'Admin',
            role: 'ADMIN',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    return user.id;
}
/**
 * Crea o aggiorna admin e super admin dalle variabili d'ambiente
 */
export async function seedAdminsFromEnv(prismaClient) {
    const adminResult = await seedAdminFromEnv(prismaClient, 'ADMIN');
    const superAdminResult = await seedAdminFromEnv(prismaClient, 'SUPER_ADMIN');
    return {
        admin: adminResult,
        superAdmin: superAdminResult,
    };
}
/**
 * Crea o aggiorna un singolo admin dalle variabili d'ambiente
 */
async function seedAdminFromEnv(prismaClient, type) {
    const prefix = type === 'ADMIN' ? 'ADMIN' : 'SUPER_ADMIN';
    const email = process.env[`${prefix}_EMAIL`];
    const password = process.env[`${prefix}_DEFAULT_PASSWORD`];
    const name = process.env[`${prefix}_DEFAULT_NAME`];
    const creditsStr = process.env[`${prefix}_DEFAULT_CREDITS`];
    // Se non ci sono env vars, skip
    if (!email || !password) {
        return null;
    }
    // Valida email
    if (!email.includes('@') || email.length < 3) {
        logger.warn(`⚠️ Invalid ${prefix}_EMAIL: ${email}`);
        return null;
    }
    // Valida password (minimo 8 caratteri)
    if (password.length < 8) {
        logger.warn(`⚠️ Invalid ${prefix}_DEFAULT_PASSWORD: must be at least 8 characters`);
        return null;
    }
    const credits = creditsStr ? parseInt(creditsStr, 10) : 10000;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        // Cerca utente esistente
        const existing = await prismaClient.users.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        let admin;
        let created = false;
        if (existing) {
            // Aggiorna utente esistente
            admin = await prismaClient.users.update({
                where: { email: email.toLowerCase().trim() },
                data: {
                    password: hashedPassword,
                    name: name?.trim() || existing.name,
                    role: type,
                    status: 'ACTIVE',
                    credits: credits,
                    updatedAt: new Date(),
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    credits: true,
                },
            });
        }
        else {
            // Crea nuovo utente
            admin = await prismaClient.users.create({
                data: {
                    id: createId(),
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    name: name?.trim() || `${type === 'ADMIN' ? 'Admin' : 'Super Admin'} onecoach`,
                    role: type,
                    status: 'ACTIVE',
                    credits: credits,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    credits: true,
                },
            });
            created = true;
        }
        return {
            admin,
            created,
        };
    }
    catch (error) {
        logger.error(`❌ Error seeding ${prefix}:`, error);
        return null;
    }
}
export default { ensureAdminUser, seedAdminsFromEnv };
