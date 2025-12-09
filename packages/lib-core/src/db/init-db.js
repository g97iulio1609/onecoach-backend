/**
 * Database Initialization Utility
 *
 * Verifica e inizializza il database con dati necessari se mancanti.
 * Funzione idempotente che può essere eseguita più volte senza problemi.
 */
/**
 * Verifica se una tabella esiste nel database
 */
async function tableExists(prisma, tableName) {
  try {
    // Prova a fare una query semplice sulla tabella
    await prisma.$queryRawUnsafe(`SELECT 1 FROM "${tableName}" LIMIT 1`);
    return true;
  } catch (error) {
    if (error && typeof error === 'object') {
      const err = error;
      if (
        err.code === '42P01' || // PostgreSQL: relation does not exist
        (err.message &&
          (err.message.includes('does not exist') || err.message.includes('relation')))
      ) {
        return false;
      }
    }
    // Se è un altro errore, assumiamo che la tabella esista
    return true;
  }
}
/**
 * Verifica se i dati essenziali esistono nel database
 */
async function checkEssentialData(prisma) {
  try {
    const [
      userCount,
      adminCount,
      workoutGoalsCount,
      nutritionGoalsCount,
      policiesCount,
      exerciseTypesCount,
    ] = await Promise.all([
      prisma.users.count().catch(() => 0),
      prisma.users.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }).catch(() => 0),
      prisma.workout_goals.count().catch(() => 0),
      prisma.nutrition_goals.count().catch(() => 0),
      prisma.policies.count().catch(() => 0),
      prisma.exercise_types.count().catch(() => 0),
    ]);
    return {
      hasUsers: userCount > 0,
      hasAdmin: adminCount > 0,
      hasWorkoutGoals: workoutGoalsCount > 0,
      hasNutritionGoals: nutritionGoalsCount > 0,
      hasPolicies: policiesCount > 0,
      hasExerciseTypes: exerciseTypesCount > 0,
    };
  } catch (error) {
    // Se c'è un errore, assumiamo che i dati non esistano
    return {
      hasUsers: false,
      hasAdmin: false,
      hasWorkoutGoals: false,
      hasNutritionGoals: false,
      hasPolicies: false,
      hasExerciseTypes: false,
    };
  }
}
/**
 * Inizializza il database con dati necessari se mancanti
 * Funzione idempotente - può essere eseguita più volte senza problemi
 */
export async function initializeDatabase(prisma, options) {
  const result = {
    success: true,
    initialized: [],
    skipped: [],
    errors: [],
  };
  try {
    // Verifica che le tabelle esistano
    const usersTableExists = await tableExists(prisma, 'users');
    if (!usersTableExists) {
      result.errors.push('Database tables not found. Please run migrations first.');
      result.success = false;
      return result;
    }
    // Verifica se i dati essenziali esistono già
    const essentialData = await checkEssentialData(prisma);
    const isInitialized =
      essentialData.hasWorkoutGoals &&
      essentialData.hasNutritionGoals &&
      essentialData.hasExerciseTypes &&
      essentialData.hasPolicies;
    if (options?.skipIfInitialized && isInitialized) {
      result.skipped.push('Database already initialized');
      return result;
    }
    console.warn('🌱 Initializing database with required data...');
    // Usa import dinamici per evitare che i file di seed vengano inclusi nel bundle di Next.js
    // 1. Seed Auth (Admin e Demo users) - sempre necessario
    try {
      console.warn('👤 Seeding auth users...');
      const { seedAuth } = await import('../seeds/seed-auth');
      const { admin } = await seedAuth(prisma);
      if (admin) {
        result.initialized.push('Auth users');
      } else {
        result.skipped.push('Auth users (no admin credentials in env)');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Auth seed failed: ${errorMsg}`);
    }
    // 2. Seed Translations and Goals - sempre necessario
    try {
      if (!essentialData.hasWorkoutGoals || !essentialData.hasNutritionGoals) {
        console.warn('🌐 Seeding translations and goals...');
        const { seedTranslationsAndGoals } = await import('../seeds/seed-translations-and-goals');
        await seedTranslationsAndGoals(prisma);
        result.initialized.push('Translations and goals');
      } else {
        result.skipped.push('Translations and goals (already exist)');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Translations and goals seed failed: ${errorMsg}`);
    }
    // 3. Seed Exercise Catalog - necessario se non esiste
    try {
      if (!essentialData.hasExerciseTypes) {
        console.warn('🏋️ Seeding exercise catalog...');
        const admin = await prisma.users.findFirst({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        });
        if (admin) {
          const { seedExerciseCatalog } = await import('../seeds/seed-exercise-catalog');
          await seedExerciseCatalog(prisma, admin.id);
          result.initialized.push('Exercise catalog');
        } else {
          result.skipped.push('Exercise catalog (no admin found)');
        }
      } else {
        result.skipped.push('Exercise catalog (already exists)');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Exercise catalog seed failed: ${errorMsg}`);
    }
    // 4. Seed Policies - necessario se non esistono
    try {
      if (!essentialData.hasPolicies) {
        console.warn('📜 Seeding policies...');
        const admin = await prisma.users.findFirst({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        });
        if (admin) {
          const { seedPolicies } = await import('../seeds/seed-policies');
          await seedPolicies(prisma, admin.id);
          result.initialized.push('Policies');
        } else {
          result.skipped.push('Policies (no admin found)');
        }
      } else {
        result.skipped.push('Policies (already exist)');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Policies seed failed: ${errorMsg}`);
    }
    // 5. Seed Affiliate Program - opzionale
    try {
      const admin = await prisma.users.findFirst({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      });
      if (admin) {
        const { seedAffiliate } = await import('../seeds/seed-affiliate');
        await seedAffiliate(prisma, admin.id);
        result.initialized.push('Affiliate program');
      } else {
        result.skipped.push('Affiliate program (no admin found)');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Affiliate program seed failed: ${errorMsg}`);
    }
    // 6. Seed AI Configs - opzionale
    // 6. Seed Marketplace - opzionale
    try {
      const { seedMarketplace } = await import('../seeds/seed-marketplace');
      await seedMarketplace(prisma);
      result.initialized.push('Marketplace');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Marketplace seed failed: ${errorMsg}`);
    }
    // 7. Seed Food Items - opzionale
    try {
      const { seedFoodItems } = await import('../seeds/seed-food-items');
      await seedFoodItems(prisma);
      result.initialized.push('Food items');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Food items seed failed: ${errorMsg}`);
    }
    if (result.errors.length > 0) {
      result.success = false;
    }
    console.warn('✅ Database initialization completed');
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Database initialization failed: ${errorMsg}`);
    result.success = false;
    return result;
  }
}
