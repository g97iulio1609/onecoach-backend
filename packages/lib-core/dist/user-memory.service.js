/**
 * User Memory Service
 *
 * Gestione memoria dinamica utente per personalizzazione AI.
 * La memoria è strutturata per dominio (workout, nutrition, oneagenda, etc.)
 * e si aggiorna automaticamente dalle interazioni utente.
 */
import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { createId } from '@onecoach/lib-shared/id-generator';
/**
 * Default empty memory structure
 */
const DEFAULT_MEMORY = {
    workout: {
        preferences: {},
        patterns: [],
        history: [],
        insights: [],
        lastUpdated: new Date().toISOString(),
    },
    nutrition: {
        preferences: {},
        patterns: [],
        history: [],
        insights: [],
        lastUpdated: new Date().toISOString(),
    },
    oneagenda: {
        preferences: {},
        patterns: [],
        history: [],
        insights: [],
        lastUpdated: new Date().toISOString(),
    },
    projects: {
        preferences: {},
        patterns: [],
        history: [],
        insights: [],
        lastUpdated: new Date().toISOString(),
    },
    tasks: {
        preferences: {},
        patterns: [],
        history: [],
        insights: [],
        lastUpdated: new Date().toISOString(),
    },
    habits: {
        preferences: {},
        patterns: [],
        history: [],
        insights: [],
        lastUpdated: new Date().toISOString(),
    },
    general: {
        preferences: {},
        patterns: [],
        history: [],
        insights: [],
        lastUpdated: new Date().toISOString(),
    },
};
/**
 * User Memory Service
 */
export class UserMemoryService {
    /**
     * Get or create user memory
     */
    async getOrCreate(userId) {
        let memory = await prisma.user_memories.findUnique({
            where: { userId },
        });
        if (!memory) {
            memory = await prisma.user_memories.create({
                data: {
                    id: createId(),
                    userId,
                    memory: DEFAULT_MEMORY,
                    version: 1,
                    updatedAt: new Date(),
                },
            });
        }
        return memory;
    }
    /**
     * Get user memory with optional filtering
     */
    async getMemory(userId, options = {}) {
        const memory = await this.getOrCreate(userId);
        const fullMemory = memory.memory || DEFAULT_MEMORY;
        // If no domain specified, return full memory
        if (!options.domain) {
            return this.filterMemory(fullMemory, options);
        }
        // Return only specified domain
        const domainMemory = fullMemory[options.domain];
        if (!domainMemory) {
            return { [options.domain]: DEFAULT_MEMORY[options.domain] };
        }
        return {
            [options.domain]: this.filterDomainMemory(domainMemory, options),
        };
    }
    /**
     * Update memory for a specific domain
     */
    async updateMemory(userId, update) {
        const memory = await this.getOrCreate(userId);
        const currentMemory = memory.memory || DEFAULT_MEMORY;
        const domain = update.domain;
        const currentDomainMemory = currentMemory[domain] || {
            preferences: {},
            patterns: [],
            history: [],
            insights: [],
            lastUpdated: new Date().toISOString(),
        };
        // Merge updates
        const updatedDomainMemory = {
            preferences: {
                ...currentDomainMemory.preferences,
                ...update.updates.preferences,
            },
            patterns: update.updates.patterns
                ? [...currentDomainMemory.patterns, ...update.updates.patterns]
                : currentDomainMemory.patterns,
            history: update.updates.history
                ? [...currentDomainMemory.history, ...update.updates.history]
                : currentDomainMemory.history,
            insights: update.updates.insights
                ? [...currentDomainMemory.insights, ...update.updates.insights]
                : currentDomainMemory.insights,
            lastUpdated: new Date().toISOString(),
        };
        // Update memory structure
        const updatedMemory = {
            ...currentMemory,
            [domain]: updatedDomainMemory,
        };
        // Save to database
        await prisma.user_memories.update({
            where: { userId },
            data: {
                memory: updatedMemory,
                updatedAt: new Date(),
            },
        });
        // Auto-save version (KISS: simple auto-versioning on significant updates)
        await this.saveVersion(userId, 'auto', 'Automatic save on memory update');
        return updatedMemory;
    }
    /**
     * Save memory version snapshot
     */
    async saveVersion(userId, changeType, changeNote) {
        const currentMemory = await prisma.user_memories.findUnique({
            where: { userId },
        });
        if (!currentMemory)
            return;
        // Get latest version number
        const latestVersion = await prisma.user_memory_versions.findFirst({
            where: { userId },
            orderBy: { versionNumber: 'desc' },
            select: { versionNumber: true },
        });
        const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;
        await prisma.user_memory_versions.create({
            data: {
                id: createId(),
                userId,
                versionNumber: nextVersionNumber,
                memory: currentMemory.memory,
                changeType,
                changeNote: changeNote || null,
                changedBy: changeType === 'manual' ? 'user' : changeType === 'enhanced' ? 'ai' : 'system',
            },
        });
    }
    /**
     * Get version history
     */
    async getVersionHistory(userId, limit = 20) {
        const versions = await prisma.user_memory_versions.findMany({
            where: { userId },
            orderBy: { versionNumber: 'desc' },
            take: limit,
        });
        return versions.map((v) => ({
            id: v.id,
            versionNumber: v.versionNumber,
            memory: v.memory,
            changeType: v.changeType,
            changeNote: v.changeNote,
            changedBy: v.changedBy,
            createdAt: v.createdAt,
        }));
    }
    /**
     * Get specific version
     */
    async getVersion(userId, versionNumber) {
        const version = await prisma.user_memory_versions.findFirst({
            where: {
                userId,
                versionNumber,
            },
        });
        return version ? version.memory : null;
    }
    /**
     * Restore memory to specific version
     */
    async restoreVersion(userId, versionNumber) {
        const version = await this.getVersion(userId, versionNumber);
        if (!version) {
            throw new Error(`Version ${versionNumber} not found`);
        }
        // Save current state as version before restore
        await this.saveVersion(userId, 'manual', `Restore to version ${versionNumber}`);
        // Restore memory
        await prisma.user_memories.update({
            where: { userId },
            data: {
                memory: version,
                updatedAt: new Date(),
            },
        });
        return version;
    }
    /**
     * Add history item to memory
     */
    async addHistoryItem(userId, domain, item) {
        const historyItem = {
            id: createId(),
            timestamp: new Date().toISOString(),
            ...item,
        };
        await this.updateMemory(userId, {
            domain,
            updates: {
                history: [historyItem],
            },
        });
    }
    /**
     * Add pattern to memory
     */
    async addPattern(userId, domain, pattern) {
        const now = new Date().toISOString();
        const fullPattern = {
            ...pattern,
            firstObserved: now,
            lastObserved: now,
        };
        await this.updateMemory(userId, {
            domain,
            updates: {
                patterns: [fullPattern],
            },
        });
    }
    /**
     * Add insight to memory
     */
    async addInsight(userId, domain, insight) {
        const fullInsight = {
            id: createId(),
            generatedAt: new Date().toISOString(),
            ...insight,
        };
        await this.updateMemory(userId, {
            domain,
            updates: {
                insights: [fullInsight],
            },
        });
    }
    /**
     * Update preferences for a domain
     */
    async updatePreferences(userId, domain, preferences) {
        await this.updateMemory(userId, {
            domain,
            updates: {
                preferences,
            },
        });
    }
    /**
     * Get memory context for AI agents
     */
    async getMemoryContext(userId, domain) {
        const memory = await this.getMemory(userId, {
            domain,
            includePatterns: true,
            includeInsights: true,
            patternConfidenceThreshold: 0.5,
        });
        // Extract relevant patterns and insights
        const relevantPatterns = [];
        const relevantInsights = [];
        const recommendations = [];
        if (domain) {
            const domainMemory = memory[domain];
            if (domainMemory) {
                relevantPatterns.push(...domainMemory.patterns);
                relevantInsights.push(...domainMemory.insights);
                // Generate recommendations from patterns
                domainMemory.patterns.forEach((pattern) => {
                    const suggestions = pattern.suggestions ?? [];
                    suggestions.forEach((suggestion, index) => {
                        recommendations.push({
                            type: pattern.type,
                            message: suggestion,
                            priority: 5 - index,
                        });
                    });
                });
            }
        }
        else {
            // Cross-domain patterns and insights
            Object.values(memory).forEach((domainMemory) => {
                if (domainMemory) {
                    relevantPatterns.push(...domainMemory.patterns);
                    relevantInsights.push(...domainMemory.insights);
                }
            });
        }
        return {
            userId,
            memory,
            relevantPatterns,
            relevantInsights,
            recommendations,
        };
    }
    /**
     * Merge memory context into base context
     */
    async mergeContext(userId, baseContext, domain) {
        const memoryContext = await this.getMemoryContext(userId, domain);
        return {
            ...baseContext,
            userMemory: {
                patterns: memoryContext.relevantPatterns,
                insights: memoryContext.relevantInsights,
                recommendations: memoryContext.recommendations,
            },
        };
    }
    /**
     * Filter memory based on options
     */
    filterMemory(memory, options) {
        const filtered = {};
        Object.entries(memory).forEach(([domain, domainMemory]) => {
            if (domainMemory) {
                filtered[domain] = this.filterDomainMemory(domainMemory, options);
            }
        });
        return filtered;
    }
    /**
     * Filter domain memory based on options
     */
    filterDomainMemory(domainMemory, options) {
        const filtered = {
            preferences: domainMemory.preferences,
            patterns: options.includePatterns !== false
                ? domainMemory.patterns.filter((p) => !options.patternConfidenceThreshold ||
                    p.confidence >= options.patternConfidenceThreshold)
                : [],
            history: options.includeHistory !== false
                ? options.historyLimit
                    ? domainMemory.history.slice(-options.historyLimit)
                    : domainMemory.history
                : [],
            insights: options.includeInsights !== false
                ? domainMemory.insights.filter((i) => !i.expiresAt || new Date(i.expiresAt) > new Date())
                : [],
            lastUpdated: domainMemory.lastUpdated,
        };
        return filtered;
    }
    /**
     * Clean up old history items (keep only recent N items per domain)
     */
    async cleanupHistory(userId, keepItems = 100) {
        const memory = await this.getMemory(userId);
        const cleanedMemory = {};
        Object.entries(memory).forEach(([domain, domainMemory]) => {
            if (domainMemory) {
                cleanedMemory[domain] = {
                    ...domainMemory,
                    history: domainMemory.history.slice(-keepItems),
                };
            }
        });
        await prisma.user_memories.update({
            where: { userId },
            data: {
                memory: cleanedMemory,
                updatedAt: new Date(),
            },
        });
    }
    /**
     * Get last analyzed timestamp
     */
    async getLastAnalyzedAt(userId) {
        const memory = await prisma.user_memories.findUnique({
            where: { userId },
            select: { lastAnalyzedAt: true },
        });
        return memory?.lastAnalyzedAt || null;
    }
    /**
     * Update last analyzed timestamp
     */
    async updateLastAnalyzedAt(userId) {
        await prisma.user_memories.update({
            where: { userId },
            data: {
                lastAnalyzedAt: new Date(),
            },
        });
    }
}
// Export singleton instance
export const userMemoryService = new UserMemoryService();
