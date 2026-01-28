import type { PositionName, SecuritySettings } from '../types';

// Settings that can be persisted
export interface UserSettings {
    logoSize: number;
    logoOpacity: number;
    preferredPosition: PositionName;
    autoSize: boolean;           // 是否啟用自適應大小
    autoSizePercent: number;     // 自適應大小百分比 (3-15%)
    autoFallback: boolean;       // 佔用時自動遞補位置
    fallbackPriority: PositionName[];  // 遞補順序優先級
}

// 預設遞補順序：由上而下、由左至右
// 數字 = 優先順序，1 最高，9 最低
export const DEFAULT_FALLBACK_PRIORITY: PositionName[] = [
    'right-bottom',    // 1
    'right-center',    // 2
    'bottom-center',   // 3
    'right-top',       // 4
    'center',          // 5
    'left-bottom',     // 6
    'top-center',      // 7
    'left-center',     // 8
    'left-top',        // 9
];

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
    logoSize: 80,
    logoOpacity: 100,
    preferredPosition: 'right-bottom',
    autoSize: false,
    autoSizePercent: 8,
    autoFallback: false,
    fallbackPriority: DEFAULT_FALLBACK_PRIORITY,
};

// Default security settings
// Note: Passwords are NOT persisted to localStorage for security reasons
export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
    enabled: false,
    userPassword: '',
    ownerPassword: '',
    permissions: {
        printing: 'highResolution',
        copying: true,
        modifying: true,
        annotating: true,
    }
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
            autoFallback: typeof parsed.autoFallback === 'boolean' ? parsed.autoFallback : DEFAULT_SETTINGS.autoFallback,
            fallbackPriority: validateFallbackPriority(parsed.fallbackPriority) ? parsed.fallbackPriority : DEFAULT_SETTINGS.fallbackPriority,
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

function validateFallbackPriority(value: unknown): value is PositionName[] {
    if (!Array.isArray(value)) return false;
    if (value.length !== 9) return false;
    const validPositions: PositionName[] = [
        'right-bottom', 'right-top', 'left-bottom', 'left-top',
        'center', 'top-center', 'bottom-center', 'left-center', 'right-center'
    ];
    return value.every(v => validPositions.includes(v as PositionName)) &&
           new Set(value).size === 9;
}
