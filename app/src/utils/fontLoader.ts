/**
 * CJK font loader for pdf-lib.
 * Detects non-WinAnsi characters and fetches Noto Sans TC from CDN on demand.
 * Uses harfbuzzjs WASM to subset the font to only the needed characters
 * before embedding, reducing PDF size from ~4-8 MB to ~10-50 KB.
 *
 * Loading strategy:
 *   1. Download full font from jsdelivr CDN (cached for session)
 *   2. Fallback: GitHub raw CDN
 *   3. Subset to needed characters via harfbuzzjs WASM
 *   4. If subsetting fails, fall back to full font embedding
 */

import { subsetFont } from './fontSubsetter';

/** Cached full font — downloaded once, lives for entire session. */
let fullFontCache: ArrayBuffer | null = null;
let fullFontPromise: Promise<ArrayBuffer> | null = null;

/**
 * Check if text contains characters outside WinAnsi encoding.
 * WinAnsi covers ASCII printable (U+0020–U+007E) and Latin-1 Supplement (U+00A0–U+00FF).
 */
export function containsNonWinAnsiChars(text: string): boolean {
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code > 0x00FF) return true;
    }
    return false;
}

// CDN URLs for Noto Sans TC Regular (Traditional Chinese) — static OTF, NOT variable font.
const CJK_FONT_URLS = [
    'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/TC/NotoSansTC-Regular.otf',
    'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/TC/NotoSansTC-Regular.otf',
];

/**
 * Collect unique non-WinAnsi characters from all text strings.
 */
function collectUniqueNonWinAnsiChars(texts: string[]): string {
    const chars = new Set<string>();
    for (const t of texts) {
        for (const ch of t) {
            if (ch.codePointAt(0)! > 0xFF) {
                chars.add(ch);
            }
        }
    }
    return [...chars].join('');
}

/**
 * Download and cache the full CJK font from CDN.
 * Downloaded once and cached for the session lifetime.
 */
async function loadFullCjkFont(): Promise<ArrayBuffer> {
    if (fullFontCache) return fullFontCache;
    if (fullFontPromise) return fullFontPromise;

    fullFontPromise = (async () => {
        for (const url of CJK_FONT_URLS) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const bytes = await response.arrayBuffer();
                    if (bytes.byteLength < 1000) {
                        console.warn(`[CJK Font] ${url} returned suspiciously small file (${bytes.byteLength} bytes), skipping`);
                        continue;
                    }
                    fullFontCache = bytes;
                    console.info(`[CJK Font] Full font cached: ${(bytes.byteLength / 1024).toFixed(0)} KB from ${url}`);
                    return bytes;
                }
                console.warn(`[CJK Font] ${url} responded ${response.status}`);
            } catch (err) {
                console.warn(`[CJK Font] Failed to fetch ${url}:`, err);
                continue;
            }
        }

        throw new Error(
            '無法載入中文字型（Noto Sans TC），請確認網路連線後重試。'
        );
    })();

    try {
        return await fullFontPromise;
    } catch (error) {
        fullFontPromise = null; // Allow retry on next call
        throw error;
    }
}

/**
 * Load CJK font, subsetted to only the characters in `texts`.
 *
 * Flow:
 *   1. Download full font from CDN (cached after first call)
 *   2. Extract unique non-WinAnsi characters from texts
 *   3. Subset via harfbuzzjs WASM
 *   4. If subsetting fails, return full font as fallback
 *
 * @param texts  All strings that will be rendered with the CJK font.
 */
export async function loadCjkFont(texts: string[] = []): Promise<ArrayBuffer> {
    // Step 1: Ensure full font is downloaded and cached
    const fullFont = await loadFullCjkFont();

    // Step 2: Collect unique non-WinAnsi characters
    const chars = collectUniqueNonWinAnsiChars(texts);
    if (chars.length === 0) {
        // No non-WinAnsi characters — return full font
        // (caller checks needsCjkFont, so this rarely happens)
        return fullFont;
    }

    // Step 3: Subset via harfbuzzjs
    try {
        const subsetBytes = await subsetFont(fullFont, chars);
        console.info(
            `[CJK Font] Subset: ${chars.length} chars, ` +
            `${(fullFont.byteLength / 1024).toFixed(0)} KB → ${(subsetBytes.byteLength / 1024).toFixed(0)} KB ` +
            `(${((1 - subsetBytes.byteLength / fullFont.byteLength) * 100).toFixed(0)}% reduction)`
        );
        return subsetBytes;
    } catch (err) {
        // Step 4: Subsetting failed — fall back to full font
        console.warn('[CJK Font] Subsetting failed, using full font:', err);
        return fullFont;
    }
}
