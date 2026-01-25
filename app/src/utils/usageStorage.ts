import type { UsageStats } from '../types';

const STORAGE_KEY = 'aurapdf_usage_stats';

// Default empty stats
export const DEFAULT_USAGE_STATS: UsageStats = {
    totalPagesProcessed: 0,
    totalFilesProcessed: 0,
    totalCostAccumulated: 0,
    firstUsedAt: '',
    lastUsedAt: '',
    sessionCount: 0,
};

// Load usage stats from localStorage
export function loadUsageStats(): UsageStats {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return { ...DEFAULT_USAGE_STATS };
        }

        const parsed = JSON.parse(stored);

        // Validate and return with defaults for missing fields
        return {
            totalPagesProcessed: typeof parsed.totalPagesProcessed === 'number'
                ? parsed.totalPagesProcessed : 0,
            totalFilesProcessed: typeof parsed.totalFilesProcessed === 'number'
                ? parsed.totalFilesProcessed : 0,
            totalCostAccumulated: typeof parsed.totalCostAccumulated === 'number'
                ? parsed.totalCostAccumulated : 0,
            firstUsedAt: typeof parsed.firstUsedAt === 'string'
                ? parsed.firstUsedAt : '',
            lastUsedAt: typeof parsed.lastUsedAt === 'string'
                ? parsed.lastUsedAt : '',
            sessionCount: typeof parsed.sessionCount === 'number'
                ? parsed.sessionCount : 0,
        };
    } catch {
        return { ...DEFAULT_USAGE_STATS };
    }
}

// Save usage stats to localStorage
export function saveUsageStats(stats: UsageStats): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
        console.warn('Failed to save usage stats to localStorage');
    }
}

// Record a usage session and update cumulative stats
export function recordUsage(
    pagesProcessed: number,
    costAccumulated: number
): UsageStats {
    const current = loadUsageStats();
    const now = new Date().toISOString();

    const updated: UsageStats = {
        totalPagesProcessed: current.totalPagesProcessed + pagesProcessed,
        totalFilesProcessed: current.totalFilesProcessed + 1,
        totalCostAccumulated: current.totalCostAccumulated + costAccumulated,
        firstUsedAt: current.firstUsedAt || now,
        lastUsedAt: now,
        sessionCount: current.sessionCount + 1,
    };

    saveUsageStats(updated);
    return updated;
}

// Clear all usage stats
export function clearUsageStats(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        console.warn('Failed to clear usage stats from localStorage');
    }
}
