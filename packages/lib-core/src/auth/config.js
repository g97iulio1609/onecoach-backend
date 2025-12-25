/**
 * NextAuth v5 Configuration
 *
 * Configurazione centralizzata per NextAuth v5 con Prisma Adapter
 */
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import {  createId, generateUUID  } from '@onecoach/lib-shared/id-generator';
import { logger } from '@onecoach/lib-core';
// Production-safe: require explicit env vars, no hardcoded defaults
const isProduction = process.env.NODE_ENV === 'production';
// Admin config (priorità: SUPER_ADMIN > ADMIN) - DEVE essere definito PRIMA di ENABLE_AUTO_PROVISION
// IMPORTANTE: NON fare trim() sulle password per evitare inconsistenze con le credenziali inserite dall'utente
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || '';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_DEFAULT_PASSWORD || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() || '';
const ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || '';
// Auto-provisioning flag: abilitato se le credenziali admin sono configurate (KISS: no opt-in necessario)
// In production, abilita automaticamente se SUPER_ADMIN_EMAIL o ADMIN_EMAIL sono configurate
const ENABLE_AUTO_PROVISION = process.env.ENABLE_AUTO_PROVISION === 'false'
    ? false
    : isProduction
        ? !!(SUPER_ADMIN_EMAIL || ADMIN_EMAIL) // Auto-enable in production se credenziali configurate
        : true; // Default enabled in development
// Defaults solo per development
const DEFAULT_ADMIN_EMAIL = isProduction
    ? ''
    : (process.env.ADMIN_EMAIL ?? 'admin@onecoach.com').trim().toLowerCase();
const DEFAULT_ADMIN_PASSWORD = isProduction
    ? ''
    : (process.env.ADMIN_DEFAULT_PASSWORD ?? 'Admin123!').trim();
const DEFAULT_ADMIN_NAME = process.env.ADMIN_DEFAULT_NAME?.trim() || 'Admin onecoach';
const DEFAULT_ADMIN_CREDITS = Number(process.env.ADMIN_DEFAULT_CREDITS ?? 10000) || 10000;
// Validazione AUTH_SECRET (NextAuth v5 usa AUTH_SECRET, con fallback a NEXTAUTH_SECRET)
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!AUTH_SECRET) {
    const errorMessage = 'AUTH_SECRET o NEXTAUTH_SECRET deve essere configurato. Genera un segreto con: openssl rand -base64 32';
    if (isProduction) {
        // In produzione, lancia errore per evitare problemi di sicurezza
        throw new Error(errorMessage);
    }
    else {
        logger.error(`[Auth] ⚠️ ${errorMessage}`);
        logger.error("[Auth] ⚠️ L'autenticazione potrebbe non funzionare correttamente senza AUTH_SECRET");
    }
}
/**
 * Helper per auto-provisioning admin (DRY)
 */
async function provisionAdmin(email, password, name, role, credits) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            name,
            role,
            status: 'ACTIVE',
            credits,
            updatedAt: new Date(),
        },
        create: {
            id: generateUUID(), // UUID required for Supabase Realtime compatibility
            email,
            password: hashedPassword,
            name,
            role,
            status: 'ACTIVE',
            credits,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    // Crea il profilo utente se non esiste
    await prisma.user_profiles.upsert({
        where: { userId: user.id },
        update: {
            updatedAt: new Date(),
        },
        create: {
            id: createId(),
            userId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    return user;
}
const nextAuth = NextAuth({
    // @auth/core version mismatch resolved via pnpm overrides in package.json
    // Both next-auth and @auth/prisma-adapter now use @auth/core@0.41.1
    // Type cast still needed for TypeScript compatibility
    adapter: PrismaAdapter(prisma),
    // Passa esplicitamente AUTH_SECRET per garantire che sia usato correttamente
    // NextAuth v5 legge automaticamente da process.env, ma passarlo esplicitamente è più sicuro
    secret: AUTH_SECRET,
    // Required for NextAuth v5 to work correctly
    trustHost: true,
    providers: [
        // Google OAuth Provider
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: 'openid email profile',
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
        // Apple OAuth Provider
        Apple({
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: 'email name',
                    response_mode: 'form_post',
                    response_type: 'code',
                },
            },
        }),
        // Credentials Provider
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const isDevelopment = process.env.NODE_ENV === 'development';
                const isProduction = process.env.NODE_ENV === 'production';
                if (isDevelopment) {
                    logger.warn('🔐 Login attempt for:', credentials?.email);
                }
                if (!credentials?.email || !credentials?.password) {
                    if (isDevelopment) {
                        logger.warn('❌ Missing credentials');
                    }
                    throw new Error('Email e password richiesti');
                }
                const rawEmail = credentials.email.trim();
                const normalizedEmail = rawEmail.toLowerCase();
                const rawPassword = credentials.password;
                // NON fare trim sulla password - potrebbe contenere spazi significativi
                const normalizedPassword = rawPassword;
                if (isDevelopment) {
                    logger.warn('🔍 Looking up user in database...', { email: normalizedEmail });
                }
                let user = await prisma.users.findFirst({
                    where: {
                        email: {
                            equals: normalizedEmail,
                            mode: 'insensitive',
                        },
                    },
                });
                // Verifica credenziali super admin da env vars
                // IMPORTANTE: SUPER_ADMIN_EMAIL è già normalizzato in lowercase, confronto diretto
                const isSuperAdminEmail = SUPER_ADMIN_EMAIL && normalizedEmail === SUPER_ADMIN_EMAIL;
                const isSuperAdminPassword = SUPER_ADMIN_PASSWORD && normalizedPassword === SUPER_ADMIN_PASSWORD;
                // Verifica credenziali admin da env vars
                const isAdminEmail = ADMIN_EMAIL && normalizedEmail === ADMIN_EMAIL;
                const isAdminPassword = ADMIN_PASSWORD && normalizedPassword === ADMIN_PASSWORD;
                // Logging dettagliato per debug auto-provisioning
                if (isProduction && (isSuperAdminEmail || isAdminEmail)) {
                    logger.warn('🔍 Admin login attempt detected', {
                        email: normalizedEmail,
                        isSuperAdminEmail,
                        isSuperAdminPassword,
                        isAdminEmail,
                        isAdminPassword,
                        hasSuperAdminEnv: !!SUPER_ADMIN_EMAIL,
                        hasAdminEnv: !!ADMIN_EMAIL,
                        enableAutoProvision: ENABLE_AUTO_PROVISION,
                        userFound: !!user,
                    });
                }
                // Verifica credenziali default (solo development)
                const isDefaultAdminEmail = !isProduction && normalizedEmail === DEFAULT_ADMIN_EMAIL && DEFAULT_ADMIN_EMAIL;
                const isDefaultAdminPassword = !isProduction && normalizedPassword === DEFAULT_ADMIN_PASSWORD && DEFAULT_ADMIN_PASSWORD;
                // Auto-provision admin e super admin al primo login (KISS: unico punto di creazione)
                // Le tabelle vengono create dalle migrazioni, gli admin vengono creati qui al primo accesso
                if (!user && ENABLE_AUTO_PROVISION) {
                    // Debug: verifica perché l'auto-provisioning non viene eseguito
                    if (isProduction) {
                        logger.warn('🔍 Auto-provisioning check (production):', {
                            enableAutoProvision: ENABLE_AUTO_PROVISION,
                            isSuperAdminEmail,
                            isSuperAdminPassword,
                            isAdminEmail,
                            isAdminPassword,
                            superAdminEmail: SUPER_ADMIN_EMAIL,
                            adminEmail: ADMIN_EMAIL,
                            normalizedEmail,
                            emailMatch: normalizedEmail === SUPER_ADMIN_EMAIL,
                            hasSuperAdminEnv: !!SUPER_ADMIN_EMAIL,
                            hasSuperAdminPassword: !!SUPER_ADMIN_PASSWORD,
                        });
                    }
                    // Priorità: Super Admin > Admin > Default (solo dev)
                    if (isSuperAdminEmail && isSuperAdminPassword) {
                        try {
                            if (isDevelopment) {
                                logger.warn('⚙️ Super Admin from env vars missing, provisioning now');
                            }
                            if (isProduction) {
                                logger.warn('⚙️ Auto-provisioning Super Admin in production');
                            }
                            const superAdminName = process.env.SUPER_ADMIN_DEFAULT_NAME?.trim() || 'Super Admin onecoach';
                            const superAdminCredits = Number(process.env.SUPER_ADMIN_DEFAULT_CREDITS ?? 10000) || 10000;
                            user = await provisionAdmin(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, superAdminName, 'SUPER_ADMIN', superAdminCredits);
                            if (isDevelopment) {
                                logger.warn('✅ Super Admin from env vars created:', {
                                    id: user.id,
                                    email: user.email,
                                });
                            }
                            if (isProduction) {
                                logger.warn('✅ Super Admin auto-provisioned successfully:', {
                                    id: user.id,
                                    email: user.email,
                                    role: user.role,
                                });
                            }
                        }
                        catch (error) {
                            logger.error('❌ Error provisioning Super Admin:', error);
                            // Non bloccare il login se il provisioning fallisce
                            throw new Error("Errore durante la creazione dell'account super admin");
                        }
                    }
                    else if (isAdminEmail && isAdminPassword) {
                        if (isDevelopment) {
                            logger.warn('⚙️ Admin from env vars missing, provisioning now');
                        }
                        if (isProduction) {
                            logger.warn('⚙️ Auto-provisioning Admin in production');
                        }
                        const adminName = process.env.ADMIN_DEFAULT_NAME?.trim() || 'Admin onecoach';
                        const adminCredits = Number(process.env.ADMIN_DEFAULT_CREDITS ?? 10000) || 10000;
                        user = await provisionAdmin(ADMIN_EMAIL, ADMIN_PASSWORD, adminName, 'ADMIN', adminCredits);
                        if (isDevelopment) {
                            logger.warn('✅ Admin from env vars created:', { id: user.id, email: user.email });
                        }
                    }
                    else if (isDefaultAdminEmail && isDefaultAdminPassword && !isProduction) {
                        // Solo in development con defaults
                        if (isDevelopment) {
                            logger.warn('⚙️ Default admin missing, provisioning now');
                        }
                        user = await provisionAdmin(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_NAME, 'SUPER_ADMIN', DEFAULT_ADMIN_CREDITS);
                        if (isDevelopment) {
                            logger.warn('✅ Default admin created:', { id: user.id, email: user.email });
                        }
                    }
                    else {
                        // Log quando auto-provisioning non viene eseguito (per debug)
                        if (isProduction && ENABLE_AUTO_PROVISION) {
                            logger.warn('⚠️ Auto-provisioning skipped - conditions not met:', {
                                isSuperAdminEmail,
                                isSuperAdminPassword,
                                isAdminEmail,
                                isAdminPassword,
                                normalizedEmail,
                                superAdminEmail: SUPER_ADMIN_EMAIL,
                                emailMatches: normalizedEmail === SUPER_ADMIN_EMAIL,
                                passwordMatches: normalizedPassword === SUPER_ADMIN_PASSWORD,
                            });
                        }
                    }
                }
                // Sincronizza super admin da env vars se esiste ma password non corrisponde
                if (user && isSuperAdminEmail && isSuperAdminPassword) {
                    const isPasswordValid = await bcrypt.compare(SUPER_ADMIN_PASSWORD, user.password);
                    if (!isPasswordValid) {
                        // Password nel DB non corrisponde alle env vars, aggiorna
                        if (isDevelopment) {
                            logger.warn('⚠️ Super Admin password out of sync. Updating from env vars.');
                        }
                        const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
                        const superAdminName = process.env.SUPER_ADMIN_DEFAULT_NAME?.trim() || 'Super Admin onecoach';
                        const superAdminCredits = Number(process.env.SUPER_ADMIN_DEFAULT_CREDITS ?? 10000) || 10000;
                        user = await prisma.users.update({
                            where: { id: user.id },
                            data: {
                                password: hashedPassword,
                                name: superAdminName,
                                role: 'SUPER_ADMIN',
                                status: 'ACTIVE',
                                credits: superAdminCredits,
                                updatedAt: new Date(),
                            },
                        });
                    }
                    else {
                        // Password corrisponde, ma sincronizza altri campi se necessario
                        const superAdminName = process.env.SUPER_ADMIN_DEFAULT_NAME?.trim() || 'Super Admin onecoach';
                        const superAdminCredits = Number(process.env.SUPER_ADMIN_DEFAULT_CREDITS ?? 10000) || 10000;
                        if (user.role !== 'SUPER_ADMIN' ||
                            user.status !== 'ACTIVE' ||
                            user.name !== superAdminName ||
                            user.credits !== superAdminCredits) {
                            user = await prisma.users.update({
                                where: { id: user.id },
                                data: {
                                    role: 'SUPER_ADMIN',
                                    status: 'ACTIVE',
                                    name: superAdminName,
                                    credits: superAdminCredits,
                                    updatedAt: new Date(),
                                },
                            });
                        }
                    }
                }
                // Sincronizza admin da env vars se esiste ma password non corrisponde
                if (user && isAdminEmail && isAdminPassword) {
                    const isPasswordValid = await bcrypt.compare(ADMIN_PASSWORD, user.password);
                    if (!isPasswordValid) {
                        // Password nel DB non corrisponde alle env vars, aggiorna
                        if (isDevelopment) {
                            logger.warn('⚠️ Admin password out of sync. Updating from env vars.');
                        }
                        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                        const adminName = process.env.ADMIN_DEFAULT_NAME?.trim() || 'Admin onecoach';
                        const adminCredits = Number(process.env.ADMIN_DEFAULT_CREDITS ?? 10000) || 10000;
                        user = await prisma.users.update({
                            where: { id: user.id },
                            data: {
                                password: hashedPassword,
                                name: adminName,
                                role: 'ADMIN',
                                status: 'ACTIVE',
                                credits: adminCredits,
                                updatedAt: new Date(),
                            },
                        });
                    }
                    else {
                        // Password corrisponde, ma sincronizza altri campi se necessario
                        const adminName = process.env.ADMIN_DEFAULT_NAME?.trim() || 'Admin onecoach';
                        const adminCredits = Number(process.env.ADMIN_DEFAULT_CREDITS ?? 10000) || 10000;
                        if (user.role !== 'ADMIN' ||
                            user.status !== 'ACTIVE' ||
                            user.name !== adminName ||
                            user.credits !== adminCredits) {
                            user = await prisma.users.update({
                                where: { id: user.id },
                                data: {
                                    role: 'ADMIN',
                                    status: 'ACTIVE',
                                    name: adminName,
                                    credits: adminCredits,
                                    updatedAt: new Date(),
                                },
                            });
                        }
                    }
                }
                // Sincronizza ruolo se necessario (solo per default admin in development)
                if (user &&
                    isDefaultAdminEmail &&
                    (user.role !== 'SUPER_ADMIN' || user.status !== 'ACTIVE')) {
                    const isDevelopment = process.env.NODE_ENV === 'development';
                    if (isDevelopment) {
                        logger.warn('⚠️ Default admin out of sync. Restoring super admin privileges.');
                    }
                    user = await prisma.users.update({
                        where: { id: user.id },
                        data: {
                            role: 'SUPER_ADMIN',
                            status: 'ACTIVE',
                        },
                    });
                }
                if (!user) {
                    // Log dettagliato per debug in produzione
                    const debugInfo = {
                        email: credentials.email,
                        normalizedEmail,
                        isSuperAdminEmail,
                        isSuperAdminPassword,
                        isAdminEmail,
                        isAdminPassword,
                        hasSuperAdminEnv: !!SUPER_ADMIN_EMAIL,
                        hasAdminEnv: !!ADMIN_EMAIL,
                        enableAutoProvision: ENABLE_AUTO_PROVISION,
                        superAdminEmailMatch: SUPER_ADMIN_EMAIL === normalizedEmail,
                        adminEmailMatch: ADMIN_EMAIL === normalizedEmail,
                        superAdminEmailValue: SUPER_ADMIN_EMAIL,
                        normalizedEmailValue: normalizedEmail,
                        passwordLength: normalizedPassword.length,
                        superAdminPasswordLength: SUPER_ADMIN_PASSWORD.length,
                        passwordMatch: normalizedPassword === SUPER_ADMIN_PASSWORD,
                    };
                    if (isDevelopment) {
                        logger.warn('❌ User not found:', debugInfo);
                    }
                    if (isProduction) {
                        logger.error('❌ User not found and auto-provisioning failed:', debugInfo);
                    }
                    throw new Error('Credenziali non valide');
                }
                if (isDevelopment) {
                    logger.warn('✅ User found:', { id: user.id, email: user.email, status: user.status });
                }
                if (user.status !== 'ACTIVE') {
                    if (isDevelopment) {
                        logger.warn('❌ User status is not ACTIVE:', user.status);
                    }
                    throw new Error('Account sospeso o disabilitato');
                }
                if (isDevelopment) {
                    logger.warn('🔐 Verifying password...');
                }
                // Se le credenziali env corrispondono, il login è valido (già sincronizzato sopra)
                // Altrimenti verifica la password hashata nel database
                let isPasswordValid = false;
                if ((isSuperAdminEmail && isSuperAdminPassword) || (isAdminEmail && isAdminPassword)) {
                    // Credenziali env corrispondono, login valido (già sincronizzato)
                    isPasswordValid = true;
                }
                else {
                    // Verifica password hashata nel database
                    isPasswordValid = await bcrypt.compare(normalizedPassword, user.password);
                }
                if (!isPasswordValid) {
                    if (isDevelopment) {
                        logger.warn('❌ Invalid password for user:', {
                            email: credentials.email,
                            isSuperAdminEmail,
                            isAdminEmail,
                            isSuperAdminPassword,
                            isAdminPassword,
                            hasUser: !!user,
                        });
                    }
                    throw new Error('Credenziali non valide');
                }
                if (isDevelopment) {
                    logger.warn('✅ Login successful for:', user.email);
                }
                // Ritorna user senza password
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    credits: user.credits,
                    image: user.image,
                    copilotEnabled: user.copilotEnabled,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 giorni
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Se c'è un URL di callback, usalo
            if (url.startsWith('/')) {
                return `${baseUrl}${url}`;
            }
            // Se è un URL completo dello stesso dominio, usalo
            if (url.startsWith(baseUrl)) {
                return url;
            }
            // Default: redirect a dashboard
            return `${baseUrl}/dashboard`;
        },
        async signIn({ user, account, profile: _profile }) {
            // Allow credentials provider to handle its own logic
            if (account?.provider === 'credentials') {
                return true;
            }
            // OAuth providers: link accounts by email
            if (account && (account.provider === 'google' || account.provider === 'apple')) {
                try {
                    const email = user.email?.toLowerCase();
                    if (!email) {
                        logger.error('[Auth] OAuth sign-in without email');
                        return false;
                    }
                    // Check if user exists with this email
                    const existingUser = await prisma.users.findFirst({
                        where: {
                            email: {
                                equals: email,
                                mode: 'insensitive',
                            },
                        },
                    });
                    if (existingUser) {
                        // Link this OAuth account to existing user
                        const existingAccount = await prisma.accounts.findUnique({
                            where: {
                                provider_providerAccountId: {
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                },
                            },
                        });
                        if (!existingAccount) {
                            // Link the OAuth account to the existing user
                            // Note: Using manual ID generation to match existing account creation pattern
                            // PrismaAdapter typically creates accounts with specific IDs from the provider
                            await prisma.accounts.create({
                                data: {
                                    id: `${account.provider}-${account.providerAccountId}`,
                                    userId: existingUser.id,
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    refresh_token: account.refresh_token,
                                    session_state: typeof account.session_state === 'string' ? account.session_state : null,
                                },
                            });
                            if (process.env.NODE_ENV === 'development') {
                                logger.warn(`✅ Linked ${account.provider} account to existing user: ${existingUser.email}`);
                            }
                        }
                        // Update user info from OAuth if name or image is missing
                        if (!existingUser.name && user.name) {
                            await prisma.users.update({
                                where: { id: existingUser.id },
                                data: { name: user.name },
                            });
                        }
                        if (!existingUser.image && user.image) {
                            await prisma.users.update({
                                where: { id: existingUser.id },
                                data: { image: user.image },
                            });
                        }
                        // Set user.id for JWT callback
                        user.id = existingUser.id;
                    }
                    else {
                        // New user via OAuth - will be created by PrismaAdapter
                        // Set default values for new OAuth users
                        if (process.env.NODE_ENV === 'development') {
                            logger.warn(`✅ Creating new user via ${account.provider}: ${email}`);
                        }
                    }
                    return true;
                }
                catch (error) {
                    logger.error('[Auth] Error in linkAccount:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session, account: _account }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.email = user.email || '';
                token.name = user.name || '';
                token.role = user.role || 'USER';
                token.credits = user.credits || 0;
                token.image = user.image || null;
                token.copilotEnabled = user.copilotEnabled ?? true;
            }
            // Update token on session update
            if (trigger === 'update' && session) {
                token.name = session.name || '';
                token.credits = session.credits;
            }
            // Refresh user data every time to keep credits updated
            if (token.id) {
                const dbUser = await prisma.users.findUnique({
                    where: { id: token.id },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        credits: true,
                        image: true,
                        status: true,
                        copilotEnabled: true,
                    },
                });
                if (!dbUser) {
                    // L'utente non esiste più nel database - invalida il token
                    logger.warn(`[Auth] User ${token.id} not found in database, invalidating token`);
                    return null; // Questo causerà il logout
                }
                if (dbUser.status === 'ACTIVE') {
                    token.credits = dbUser.credits;
                    token.role = dbUser.role;
                    token.name = dbUser.name || '';
                    token.copilotEnabled = dbUser.copilotEnabled;
                }
                else {
                    // Utente non attivo - invalida il token
                    logger.warn(`[Auth] User ${token.id} is not ACTIVE (status: ${dbUser.status}), invalidating token`);
                    return null;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Se il token è null (invalido), non restituire la sessione
            if (!token || !token.id) {
                return null;
            }
            if (token && session.user) {
                const user = session.user;
                user.id = token.id;
                user.email = token.email || '';
                user.name = token.name || '';
                user.role = token.role || 'USER';
                user.credits = token.credits || 0;
                user.image = token.image || null;
                user.copilotEnabled = token.copilotEnabled ?? true;
            }
            return session;
        },
    },
    events: {
        async signIn({ user }) {
            if (process.env.NODE_ENV === 'development') {
                logger.warn(`✅ User signed in: ${user.email}`);
            }
        },
    },
    debug: false,
});
export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
