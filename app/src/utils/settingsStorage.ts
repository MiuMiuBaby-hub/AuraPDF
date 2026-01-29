import type { PositionName, SecuritySettings, WatermarkSettings, WatermarkFontFamily, WatermarkPosition, HeaderFooterSettings, HeaderFooterRow } from '../types';

// Settings that can be persisted
export interface UserSettings {
    logoSize: number;
    logoOpacity: number;
    preferredPosition: PositionName;
    autoSize: boolean;           // 是否啟用自適應大小
    autoSizePercent: number;     // 自適應大小百分比 (3-15%)
    autoFallback: boolean;       // 佔用時自動遞補位置
    fallbackPriority: PositionName[];  // 遞補順序優先級
    watermark: WatermarkSettings;      // 浮水印設定
    headerFooter: HeaderFooterSettings; // 頁首/頁尾設定
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

// 預設浮水印設定
export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
    enabled: false,
    text: '',
    fontFamily: 'Helvetica',
    fontSize: 36,
    color: '#888888',
    opacity: 30,
    rotation: -45,
    position: 'center',
    tileSettings: {
        horizontalSpacing: 150,
        verticalSpacing: 100,
        offsetAlternateRows: true,
    },
};

// 預設頁首/頁尾單列設定
const DEFAULT_HEADER_FOOTER_ROW: HeaderFooterRow = {
    enabled: false,
    left: { text: '', enabled: false },
    center: { text: '', enabled: false },
    right: { text: '', enabled: false },
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
    margin: 30,
};

// 預設頁首/頁尾設定
export const DEFAULT_HEADER_FOOTER_SETTINGS: HeaderFooterSettings = {
    header: { ...DEFAULT_HEADER_FOOTER_ROW },
    footer: { ...DEFAULT_HEADER_FOOTER_ROW },
};

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
    logoSize: 80,
    logoOpacity: 100,
    preferredPosition: 'right-bottom',
    autoSize: false,
    autoSizePercent: 8,
    autoFallback: false,
    fallbackPriority: DEFAULT_FALLBACK_PRIORITY,
    watermark: DEFAULT_WATERMARK_SETTINGS,
    headerFooter: DEFAULT_HEADER_FOOTER_SETTINGS,
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
            watermark: validateWatermarkSettings(parsed.watermark) ? parsed.watermark : DEFAULT_SETTINGS.watermark,
            headerFooter: validateHeaderFooterSettings(parsed.headerFooter) ? parsed.headerFooter : DEFAULT_SETTINGS.headerFooter,
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

function validateWatermarkSettings(value: unknown): value is WatermarkSettings {
    if (!value || typeof value !== 'object') return false;
    const v = value as WatermarkSettings;

    const validFonts: WatermarkFontFamily[] = ['Helvetica', 'Times-Roman', 'Courier'];
    const validPositions: WatermarkPosition[] = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'tile'];

    // 基本欄位驗證
    if (typeof v.enabled !== 'boolean') return false;
    if (typeof v.text !== 'string') return false;
    if (!validFonts.includes(v.fontFamily)) return false;
    if (typeof v.fontSize !== 'number' || v.fontSize < 12 || v.fontSize > 72) return false;
    if (typeof v.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(v.color)) return false;
    if (typeof v.opacity !== 'number' || v.opacity < 10 || v.opacity > 100) return false;
    if (typeof v.rotation !== 'number' || v.rotation < -90 || v.rotation > 90) return false;
    if (!validPositions.includes(v.position)) return false;

    // 平鋪設定驗證
    if (!v.tileSettings || typeof v.tileSettings !== 'object') return false;
    const t = v.tileSettings;
    if (typeof t.horizontalSpacing !== 'number' || t.horizontalSpacing < 50 || t.horizontalSpacing > 500) return false;
    if (typeof t.verticalSpacing !== 'number' || t.verticalSpacing < 50 || t.verticalSpacing > 500) return false;
    if (typeof t.offsetAlternateRows !== 'boolean') return false;

    return true;
}

function validateHeaderFooterRow(value: unknown): value is HeaderFooterRow {
    if (!value || typeof value !== 'object') return false;
    const r = value as HeaderFooterRow;

    const validFonts: WatermarkFontFamily[] = ['Helvetica', 'Times-Roman', 'Courier'];

    // 基本欄位驗證
    if (typeof r.enabled !== 'boolean') return false;
    if (!validFonts.includes(r.fontFamily)) return false;
    if (typeof r.fontSize !== 'number' || r.fontSize < 8 || r.fontSize > 24) return false;
    if (typeof r.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(r.color)) return false;
    if (typeof r.margin !== 'number' || r.margin < 20 || r.margin > 80) return false;

    // 區塊驗證
    const validateBlock = (block: unknown): boolean => {
        if (!block || typeof block !== 'object') return false;
        const b = block as { text: unknown; enabled: unknown };
        return typeof b.text === 'string' && typeof b.enabled === 'boolean';
    };

    if (!validateBlock(r.left)) return false;
    if (!validateBlock(r.center)) return false;
    if (!validateBlock(r.right)) return false;

    return true;
}

function validateHeaderFooterSettings(value: unknown): value is HeaderFooterSettings {
    if (!value || typeof value !== 'object') return false;
    const v = value as HeaderFooterSettings;

    return validateHeaderFooterRow(v.header) && validateHeaderFooterRow(v.footer);
}
