/**
 * NextAuth v5 Configuration
 *
 * Configurazione centralizzata per NextAuth v5 con Prisma Adapter
 */
import NextAuth from 'next-auth';
type NextAuthReturn = ReturnType<typeof NextAuth>;
export declare const handlers: NextAuthReturn['handlers'];
export declare const auth: NextAuthReturn['auth'];
export declare const signIn: NextAuthReturn['signIn'];
export declare const signOut: NextAuthReturn['signOut'];
export {};
