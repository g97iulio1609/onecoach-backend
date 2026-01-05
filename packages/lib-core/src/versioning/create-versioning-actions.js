'use server';
import { prisma } from '../prisma';
/**
 * Saves a new version of an entity.
 */
export async function saveVersion(config, entityId, state, changeLog, userId) {
    try {
        // Get latest version number
        const lastVersion = await prisma[config.tableName].findFirst({
            where: { [config.entityIdField]: entityId },
            orderBy: { version: 'desc' },
            select: { version: true },
        });
        const nextVersion = (lastVersion?.version ?? 0) + 1;
        // Create new version
        const createData = config.stateToCreateInput(state, entityId, nextVersion, changeLog, userId);
        await prisma[config.tableName].create({ data: createData });
        // Prune old versions
        const count = await prisma[config.tableName].count({
            where: { [config.entityIdField]: entityId },
        });
        if (count > config.maxVersions) {
            const toDelete = await prisma[config.tableName].findMany({
                where: { [config.entityIdField]: entityId },
                orderBy: { version: 'asc' },
                take: count - config.maxVersions,
                select: { id: true },
            });
            if (toDelete.length > 0) {
                await prisma[config.tableName].deleteMany({
                    where: { id: { in: toDelete.map((v) => v.id) } },
                });
            }
        }
        return { success: true, version: nextVersion };
    }
    catch (error) {
        console.error(`Failed to save ${config.tableName} version:`, error);
        return { success: false, error: 'Failed to save version' };
    }
}
/**
 * Retrieves version history for an entity.
 */
export async function getVersions(config, entityId) {
    try {
        const records = await prisma[config.tableName].findMany({
            where: { [config.entityIdField]: entityId },
            orderBy: { version: 'desc' },
        });
        return records.map((r) => config.recordToSnapshot(r));
    }
    catch (error) {
        console.error(`Failed to get ${config.tableName} versions:`, error);
        return [];
    }
}
