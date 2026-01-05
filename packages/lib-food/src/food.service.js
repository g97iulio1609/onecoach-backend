/**
 * Food Service
 *
 * Servizio per gestione catalogo alimenti con search BM25
 * Segue pattern ExerciseService per consistenza
 *
 * NOTE: This file does not use 'server-only' because it's exported from lib-food
 * which is imported by one-agent package used in client components. The service
 * methods themselves are only executed server-side when called from API routes
 * or server components. Pure utility functions like normalizeFoodName can be
 * safely used in client components.
 */
import { prisma } from '@onecoach/lib-core/prisma';
import { Prisma } from '@prisma/client';
import { createId } from '@onecoach/lib-shared/id-generator';
import { SUPPORTED_FOOD_LOCALES } from '@onecoach/constants/supported-locales';
const DEFAULT_LOCALE = 'it';
// Cache per average document length (BM25)
let cachedAvgDocLength = null;
let avgDocLengthCacheTime = 0;
const AVG_DOC_LENGTH_CACHE_TTL_MS = 3600000; // 1 hour
/**
 * Normalizza nome alimento per matching
 */
export function normalizeFoodName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Rimuovi accenti
        .replace(/[^\w\s]/g, '') // Rimuovi caratteri speciali
        .replace(/\s+/g, ' ')
        .trim();
}
/**
 * Calcola macros per quantità data da macrosPer100g
 */
export function calculateMacrosFromQuantity(macrosPer100g, quantity, unit = 'g') {
    // Converti quantity in grammi se necessario
    let quantityInGrams = quantity;
    if (unit === 'kg')
        quantityInGrams = quantity * 1000;
    else if (unit === 'ml' && macrosPer100g.calories) {
        // Assumiamo 1ml ≈ 1g per liquidi (approssimazione)
        quantityInGrams = quantity;
    }
    const multiplier = quantityInGrams / 100;
    return {
        calories: Math.round(macrosPer100g.calories * multiplier * 100) / 100, // Round to 2 decimals
        protein: Math.round(macrosPer100g.protein * multiplier * 100) / 100,
        carbs: Math.round(macrosPer100g.carbs * multiplier * 100) / 100,
        fats: Math.round(macrosPer100g.fats * multiplier * 100) / 100,
        fiber: macrosPer100g.fiber
            ? Math.round(macrosPer100g.fiber * multiplier * 100) / 100
            : undefined,
    };
}
export class FoodService {
    /**
     * Recupera alimento per ID
     */
    static async getFoodById(id) {
        const food = await prisma.food_items.findUnique({
            where: { id },
            include: {
                food_item_translations: {
                    where: { locale: DEFAULT_LOCALE },
                    take: 1,
                },
                brand: true,
                categories: { include: { food_categories: true } },
            },
        });
        if (!food)
            return null;
        return this.mapToFoodItem(food);
    }
    /**
     * Recupera multipli alimenti per IDs (batch lookup)
     */
    static async getFoodsByIds(ids) {
        if (ids.length === 0)
            return [];
        const foods = await prisma.food_items.findMany({
            where: { id: { in: ids } },
            include: {
                food_item_translations: {
                    where: { locale: DEFAULT_LOCALE },
                },
                brand: true,
                categories: { include: { food_categories: true } },
            },
        });
        return foods.map((f) => this.mapToFoodItem(f));
    }
    /**
     * Recupera alimenti comuni (es. per contesto AI)
     * Restituisce gli ultimi alimenti creati o aggiornati
     */
    static async getCommonFoods(limit = 100) {
        const foods = await prisma.food_items.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                food_item_translations: {
                    where: { locale: DEFAULT_LOCALE },
                    take: 1,
                },
                brand: true,
                categories: { include: { food_categories: true } },
            },
        });
        return foods.map((f) => this.mapToFoodItem(f));
    }
    /**
     * Lista alimenti con paginazione
     * SSOT: Restituisce direttamente FoodsResponse da lib-api (nessuna duplicazione)
     */
    static async list(options = {}) {
        const limit = options.limit || 100;
        const page = options.page || 1;
        const pageSize = options.pageSize || limit;
        const locale = options.locale || DEFAULT_LOCALE;
        const [foods, total] = await Promise.all([
            prisma.food_items.findMany({
                take: pageSize,
                skip: (page - 1) * pageSize,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    food_item_translations: {
                        where: { locale },
                        take: 1,
                    },
                    brand: true,
                    categories: { include: { food_categories: true } },
                },
            }),
            prisma.food_items.count(),
        ]);
        const items = foods.map((f) => this.mapToFoodItem(f));
        // Restituisce direttamente FoodsResponse (allineato con lib-api)
        return {
            data: items,
            total,
            page,
            pageSize,
        };
    }
    /**
     * Cerca alimenti con BM25 search
     */
    static async searchFoods(query, options = {}) {
        const locale = options.locale || DEFAULT_LOCALE;
        const limit = options.limit || 20;
        // Null safety for query parameter
        if (!query || typeof query !== 'string' || !query.trim()) {
            return [];
        }
        const searchResults = await this.searchFullText(query, { locale, limit });
        if (searchResults.length === 0) {
            return [];
        }
        const foodIds = searchResults.map((r) => r.id);
        const foods = await prisma.food_items.findMany({
            where: { id: { in: foodIds } },
            include: {
                food_item_translations: {
                    where: { locale },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Mantieni ordine BM25
        const foodMap = new Map(foods.map((f) => [f.id, f]));
        return searchResults
            .map((r) => foodMap.get(r.id))
            .filter((f) => f !== undefined)
            .map((f) => this.mapToFoodItem(f));
    }
    /**
     * Crea nuovo alimento
     */
    static async createFood(data) {
        const nameNormalized = normalizeFoodName(data.name);
        const locale = data.locale || DEFAULT_LOCALE;
        // Calcola percentuali macro
        const totalKcal = Math.max(1, data.macrosPer100g.calories || 0);
        const proteinPct = Math.min(100, Math.max(0, ((data.macrosPer100g.protein || 0) * 4 * 100) / totalKcal));
        const carbPct = Math.min(100, Math.max(0, ((data.macrosPer100g.carbs || 0) * 4 * 100) / totalKcal));
        const fatPct = Math.min(100, Math.max(0, ((data.macrosPer100g.fats || 0) * 9 * 100) / totalKcal));
        // Calcola mainMacro se non fornito
        const mainMacro = this.calculateMainMacro(data.macrosPer100g);
        // Brand: usa brandId o crea brand da brandName
        let resolvedBrandId = data.brandId;
        if (!resolvedBrandId && data.brandName) {
            const nameNorm = normalizeFoodName(data.brandName);
            const existing = await prisma.food_brands.findFirst({ where: { nameNormalized: nameNorm } });
            const brand = existing ||
                (await prisma.food_brands.create({
                    data: { id: createId('brand'), name: data.brandName, nameNormalized: nameNorm },
                }));
            resolvedBrandId = brand.id;
        }
        const food = await prisma.food_items.create({
            data: {
                id: createId('food'),
                name: data.name,
                nameNormalized,
                barcode: data.barcode,
                macrosPer100g: data.macrosPer100g,
                servingSize: data.servingSize,
                unit: data.unit || 'g',
                metadata: data.metadata,
                imageUrl: data.imageUrl,
                brandId: resolvedBrandId || null, // Use brandId directly instead of relation
                mainMacro: mainMacro, // REQUIRED - campo presente nello schema
                proteinPct,
                carbPct,
                fatPct,
                food_item_translations: {
                    create: SUPPORTED_FOOD_LOCALES.map((locale) => ({
                        id: createId('food_trans'),
                        locale,
                        name: data.name, // Same name for all locales
                        description: data.description, // Same description for all locales (can be enhanced later with AI translation)
                    })),
                },
                ...(data.categoryIds && data.categoryIds.length
                    ? {
                        categories: {
                            createMany: {
                                data: data.categoryIds.map((cid) => ({ categoryId: String(cid) })),
                                skipDuplicates: true,
                            },
                        },
                    }
                    : {}),
            },
            include: {
                food_item_translations: {
                    where: { locale },
                },
                brand: true,
                categories: { include: { food_categories: true } },
            },
        });
        // Il risultato include già food_item_translations, brand e categories
        return this.mapToFoodItem(food);
    }
    /**
     * Aggiorna alimento esistente
     */
    static async updateFood(id, data) {
        const updateData = {
            ...(data.name && { name: data.name, nameNormalized: normalizeFoodName(data.name) }),
            ...(data.macrosPer100g && {
                macrosPer100g: data.macrosPer100g,
            }),
            ...(data.servingSize !== undefined && { servingSize: data.servingSize }),
            ...(data.unit && { unit: data.unit }),
            ...(data.barcode !== undefined && { barcode: data.barcode }),
            ...(data.metadata !== undefined && {
                metadata: data.metadata,
            }),
            ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
            updatedAt: new Date(),
        };
        // Percentuali macro e mainMacro se macros aggiornate
        if (data.macrosPer100g) {
            const totalKcal = Math.max(1, data.macrosPer100g.calories || 0);
            updateData.proteinPct = ((data.macrosPer100g.protein || 0) * 4 * 100) / totalKcal;
            updateData.carbPct = ((data.macrosPer100g.carbs || 0) * 4 * 100) / totalKcal;
            updateData.fatPct = ((data.macrosPer100g.fats || 0) * 9 * 100) / totalKcal;
            // Calcola mainMacro
            const mainMacro = this.calculateMainMacro(data.macrosPer100g);
            updateData.mainMacro =
                mainMacro;
        }
        // Brand (id o creazione da name)
        if (data.brandId || data.brandName) {
            let resolvedBrandId = data.brandId;
            if (!resolvedBrandId && data.brandName) {
                const nameNorm = normalizeFoodName(data.brandName);
                const existing = await prisma.food_brands.findFirst({
                    where: { nameNormalized: nameNorm },
                });
                const brand = existing ||
                    (await prisma.food_brands.create({
                        data: { id: createId('brand'), name: data.brandName, nameNormalized: nameNorm },
                    }));
                resolvedBrandId = brand.id;
            }
            updateData.brand = resolvedBrandId
                ? { connect: { id: resolvedBrandId } }
                : { disconnect: true };
        }
        // Aggiorna descrizione nelle traduzioni (sempre obbligatoria)
        await prisma.food_item_translations.updateMany({
            where: { foodItemId: id },
            data: { description: data.description },
        });
        const food = await prisma.food_items.update({
            where: { id },
            data: {
                ...updateData,
                ...(data.categoryIds
                    ? {
                        categories: {
                            deleteMany: {},
                            createMany: {
                                data: data.categoryIds.map((cid) => ({ categoryId: String(cid) })),
                                skipDuplicates: true,
                            },
                        },
                    }
                    : {}),
            },
            include: {
                food_item_translations: {
                    where: { locale: DEFAULT_LOCALE },
                },
                brand: true,
                categories: { include: { food_categories: true } },
            },
        });
        return this.mapToFoodItem(food);
    }
    /**
     * Calcola mainMacro dai macros
     */
    static calculateMainMacro(macros) {
        const protein = macros.protein || 0;
        const carbs = macros.carbs || 0;
        const fats = macros.fats || 0;
        // Calculate calories from each macro
        const proteinCalories = protein * 4;
        const carbsCalories = carbs * 4;
        const fatsCalories = fats * 9;
        const totalCalculatedCalories = proteinCalories + carbsCalories + fatsCalories;
        // If no macros, return balanced
        if (totalCalculatedCalories === 0) {
            return { type: 'BALANCED', percentage: 0 };
        }
        // Calculate percentages
        const proteinPercentage = (proteinCalories / totalCalculatedCalories) * 100;
        const carbsPercentage = (carbsCalories / totalCalculatedCalories) * 100;
        const fatsPercentage = (fatsCalories / totalCalculatedCalories) * 100;
        // Find predominant macro (must be > 40% to be considered predominant)
        const PREDOMINANCE_THRESHOLD = 40;
        let mainType;
        let mainPercentage;
        if (proteinPercentage >= carbsPercentage && proteinPercentage >= fatsPercentage) {
            mainType = 'PROTEIN';
            mainPercentage = proteinPercentage;
        }
        else if (carbsPercentage >= proteinPercentage && carbsPercentage >= fatsPercentage) {
            mainType = 'CARBS';
            mainPercentage = carbsPercentage;
        }
        else {
            mainType = 'FATS';
            mainPercentage = fatsPercentage;
        }
        // If no single macro is predominant (>40%), mark as BALANCED
        if (mainPercentage < PREDOMINANCE_THRESHOLD) {
            return { type: 'BALANCED', percentage: Math.round(mainPercentage * 10) / 10 };
        }
        // Round to 1 decimal place
        return {
            type: mainType,
            percentage: Math.round(mainPercentage * 10) / 10,
        };
    }
    /**
     * Cerca alimenti per nome normalizzato (batch lookup, usato in matching)
     */
    static async getFoodsByNames(names, locale = DEFAULT_LOCALE) {
        if (names.length === 0)
            return new Map();
        const normalizedNames = names.map(normalizeFoodName);
        const foods = await prisma.food_items.findMany({
            where: {
                nameNormalized: { in: normalizedNames },
            },
            include: {
                food_item_translations: {
                    where: { locale },
                },
            },
        });
        const map = new Map();
        for (const food of foods) {
            map.set(food.nameNormalized, this.mapToFoodItem(food));
        }
        return map;
    }
    /**
     * Cerca alimento per nome normalizzato esatto (usato in matching esatto)
     */
    static async getFoodByNameNormalized(normalizedName) {
        const food = await prisma.food_items.findFirst({
            where: {
                nameNormalized: normalizedName,
            },
            include: {
                food_item_translations: {
                    where: { locale: DEFAULT_LOCALE },
                },
            },
        });
        if (!food)
            return null;
        return this.mapToFoodItem(food);
    }
    /**
     * Search full-text con BM25
     */
    static async searchFullText(term, options) {
        const query = term.trim();
        if (!query) {
            return [];
        }
        const preparedTerm = query.replace(/[:!&|']/g, ' ');
        // Get average document length for BM25 (cached for 1 hour)
        let avgLen = 50.0;
        const now = Date.now();
        if (cachedAvgDocLength && now - avgDocLengthCacheTime < AVG_DOC_LENGTH_CACHE_TTL_MS) {
            avgLen = cachedAvgDocLength;
        }
        else {
            const avgDocLength = await prisma.$queryRaw(Prisma.sql `
        SELECT AVG(LENGTH(name || ' ' || COALESCE(description, '')))::numeric AS avg_length
        FROM "food_item_translations"
      `);
            avgLen = avgDocLength[0]?.avg_length ?? 50.0;
            cachedAvgDocLength = avgLen;
            avgDocLengthCacheTime = now;
        }
        const rows = await prisma.$queryRaw(Prisma.sql `
      SELECT
        fi.id AS id,
        MAX(CASE WHEN fit."locale" = ${options.locale} THEN 1 ELSE 0 END)::boolean AS has_locale,
        MAX(
          ts_rank_cd(
            to_tsvector('italian', fit.name || ' ' || COALESCE(fit.description, '')),
            plainto_tsquery('italian', ${preparedTerm})
          ) * CASE 
            WHEN fit."locale" = ${options.locale} THEN 2.0
            WHEN fit."locale" = ${DEFAULT_LOCALE} THEN 1.0
            ELSE 0.5
          END
        ) AS rank
      FROM "food_items" fi
      INNER JOIN "food_item_translations" fit ON fit."foodItemId" = fi.id
      WHERE to_tsvector('italian', fit.name || ' ' || COALESCE(fit.description, '')) @@ plainto_tsquery('italian', ${preparedTerm})
      GROUP BY fi.id
      ORDER BY rank DESC, fi."createdAt" DESC
      LIMIT ${options.limit}
    `);
        return rows;
    }
    /**
     * Mappa Prisma model a FoodItem type
     */
    static mapToFoodItem(food) {
        // Gestisce sia array che singolo elemento per food_item_translations
        const translations = Array.isArray(food.food_item_translations)
            ? food.food_item_translations
            : food.food_item_translations
                ? [food.food_item_translations]
                : [];
        const translation = translations[0];
        const mainMacro = food.mainMacro;
        return {
            id: food.id,
            name: translation?.name || food.name,
            nameNormalized: food.nameNormalized,
            barcode: food.barcode || undefined,
            macrosPer100g: food.macrosPer100g,
            servingSize: food.servingSize ? Number(food.servingSize) : 0,
            unit: food.unit,
            imageUrl: food.imageUrl || undefined,
            brandId: food.brandId || undefined,
            mainMacro: (mainMacro || { type: 'BALANCED', percentage: 0 }),
            proteinPct: food.proteinPct ? Number(food.proteinPct) : 0,
            carbPct: food.carbPct ? Number(food.carbPct) : 0,
            fatPct: food.fatPct ? Number(food.fatPct) : 0,
            metadata: {
                ...(food.metadata || {}),
                ...('brand' in food && food.brand ? { brand: food.brand.name } : {}),
                ...('categories' in food && Array.isArray(food.categories) && food.categories.length > 0
                    ? {
                        categories: food.categories
                            .map((fc) => {
                            const category = fc.food_categories;
                            return category
                                ? { id: category.id, name: category.name, slug: category.slug }
                                : null;
                        })
                            .filter((cat) => cat !== null),
                    }
                    : {}),
            },
            createdAt: food.createdAt.toISOString(),
            updatedAt: food.updatedAt.toISOString(),
        };
    }
}
// Export singleton instance
export const foodService = FoodService;
