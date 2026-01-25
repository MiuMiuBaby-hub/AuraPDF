import type { PositionName } from '../types';

// Settings that can be persisted
export interface UserSettings {
    logoSize: number;
    logoOpacity: number;
    preferredPosition: PositionName;
    autoSize: boolean;           // 是否啟用自適應大小
    autoSizePercent: number;     // 自適應大小百分比 (3-15%)
}

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
    logoSize: 80,
    logoOpacity: 100,
    preferredPosition: 'right-bottom',
    autoSize: false,
    autoSizePercent: 8,
};

const STORAGE_KEY = 'aurapdf_settings';

// Load settings from localStorage
export function loadSettings(): UserSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return { ...DEFAULT_SETTINGS };
        }

        const parsed = JSON.parse(stored);

        // Validate and merge with defaults
        return {
            logoSize: validateLogoSize(parsed.logoSize) ? parsed.logoSize : DEFAULT_SETTINGS.logoSize,
            logoOpacity: validateLogoOpacity(parsed.logoOpacity) ? parsed.logoOpacity : DEFAULT_SETTINGS.logoOpacity,
            preferredPosition: validatePosition(parsed.preferredPosition) ? parsed.preferredPosition : DEFAULT_SETTINGS.preferredPosition,
            autoSize: typeof parsed.autoSize === 'boolean' ? parsed.autoSize : DEFAULT_SETTINGS.autoSize,
            autoSizePercent: validateAutoSizePercent(parsed.autoSizePercent) ? parsed.autoSizePercent : DEFAULT_SETTINGS.autoSizePercent,
        };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

// Save settings to localStorage
export function saveSettings(settings: Partial<UserSettings>): void {
    try {
        const current = loadSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
        // Silently fail if localStorage is not available
        console.warn('Failed to save settings to localStorage');
    }
}

// Clear all saved settings
export function clearSettings(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        console.warn('Failed to clear settings from localStorage');
    }
}

// Validation helpers
function validateLogoSize(value: unknown): value is number {
    return typeof value === 'number' && value >= 40 && value <= 150;
}

function validateLogoOpacity(value: unknown): value is number {
    return typeof value === 'number' && value >= 10 && value <= 100;
}

function validatePosition(value: unknown): value is PositionName {
    const validPositions: PositionName[] = [
        'right-bottom', 'right-top', 'left-bottom', 'left-top',
        'center', 'top-center', 'bottom-center', 'left-center', 'right-center'
    ];
    return typeof value === 'string' && validPositions.includes(value as PositionName);
}

function validateAutoSizePercent(value: unknown): value is number {
    return typeof value === 'number' && value >= 3 && value <= 15;
}
