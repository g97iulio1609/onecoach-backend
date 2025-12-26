/**
 * Seed Feature Flags
 *
 * Inizializza i feature flags di default nel database.
 * Idempotente: può essere eseguito più volte senza problemi.
 */

import type { PrismaClient } from '@prisma/client';

import { logger } from '@onecoach/lib-core';
export async function seedFeatureFlags(prisma: PrismaClient, adminUserId: string) {
  // Feature flag per abilitare/disabilitare registrazioni tramite invito
  const invitationRegistrationFlag = await prisma.feature_flags.upsert({
    where: { key: 'ENABLE_INVITATION_REGISTRATION' },
    update: {},
    create: {
      key: 'ENABLE_INVITATION_REGISTRATION',
      name: 'Registrazioni tramite Invito',
      description:
        'Abilita o disabilita la possibilità di registrarsi utilizzando un codice invito. Quando disabilitato, il campo invito non sarà visibile nel form di registrazione.',
      enabled: false, // Disabilitato di default
      strategy: 'ALL',
      config: {},
      createdBy: adminUserId,
    },
  });

  logger.warn(`  ✓ Feature flag: ${invitationRegistrationFlag.key}`);

  // Feature flag per abilitare/disabilitare login con Google OAuth
  const googleLoginFlag = await prisma.feature_flags.upsert({
    where: { key: 'GOOGLE_LOGIN_ENABLED' },
    update: {},
    create: {
      key: 'GOOGLE_LOGIN_ENABLED',
      name: 'Login con Google',
      description:
        'Abilita o disabilita la possibilità di accedere tramite Google OAuth. Quando disabilitato, il pulsante "Continua con Google" non sarà visibile nella pagina di login.',
      enabled: true, // Abilitato di default
      strategy: 'ALL',
      config: {},
      createdBy: adminUserId,
    },
  });

  logger.warn(`  ✓ Feature flag: ${googleLoginFlag.key}`);

  return {
    invitationRegistrationFlag,
    googleLoginFlag,
  };
}
