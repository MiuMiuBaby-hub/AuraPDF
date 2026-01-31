/**
 * CJK font loader for pdf-lib.
 * Detects non-WinAnsi characters and fetches Noto Sans TC from CDN on demand.
 *
 * Loading strategy (tried in order):
 *   1. jsdelivr  – notofonts/noto-cjk SubsetOTF (static Regular weight)
 *   2. GitHub raw – same file, different CDN edge
 *   3. Google Fonts API – text-specific subset (tiny, very reliable)
 */

let cjkFontCache: ArrayBuffer | null = null;
let cjkFontPromise: Promise<ArrayBuffer> | null = null;
/** Characters already covered by the cached Google Fonts subset (if any). */
let cjkFontCoveredChars: Set<string> | null = null;

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
// @pdf-lib/fontkit v1.x does not reliably subset variable-weight TTF fonts,
// so we use the fixed Regular-weight OTF from notofonts/noto-cjk.
const CJK_FONT_URLS = [
    'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/TC/NotoSansTC-Regular.otf',
    'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/TC/NotoSansTC-Regular.otf',
];

/**
 * Fetch a CJK font subset via Google Fonts CSS API.
 * The `text` parameter tells Google to return a tiny font containing only the
 * glyphs needed for those specific characters — typically a few KB.
 */
async function loadCjkFontFromGoogleFonts(texts: string[]): Promise<ArrayBuffer> {
    // Collect unique non-ASCII characters across all texts
    const chars = new Set<string>();
    for (const t of texts) {
        for (const ch of t) {
            if (ch.charCodeAt(0) > 0xFF) chars.add(ch);
        }
    }
    if (chars.size === 0) throw new Error('No CJK characters to load');

    const textParam = [...chars].join('');
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+TC&text=${encodeURIComponent(textParam)}`;

    const cssRes = await fetch(cssUrl);
    if (!cssRes.ok) throw new Error(`Google Fonts CSS responded ${cssRes.status}`);
    const css = await cssRes.text();

    // Extract the first font URL from the CSS @font-face rule
    const urlMatch = css.match(/url\(([^)]+)\)/);
    if (!urlMatch) throw new Error('No font URL found in Google Fonts CSS');

    const fontRes = await fetch(urlMatch[1]);
    if (!fontRes.ok) throw new Error(`Google Fonts font responded ${fontRes.status}`);
    const bytes = await fontRes.arrayBuffer();
    if (bytes.byteLength < 100) throw new Error('Google Fonts returned empty font');

    cjkFontCoveredChars = chars;
    console.info(`[CJK Font] Loaded ${chars.size}-char subset (${(bytes.byteLength / 1024).toFixed(0)} KB) via Google Fonts API`);
    return bytes;
}

/**
 * Load CJK font with in-memory caching.
 *
 * @param texts  All strings that will be rendered with the CJK font.
 *               Used by the Google Fonts fallback to request only the
 *               needed character subset.  Pass an empty array if unknown.
 */
export async function loadCjkFont(texts: string[] = []): Promise<ArrayBuffer> {
    // If we have a full-font cache, reuse it (covers all characters)
    if (cjkFontCache && cjkFontCoveredChars === null) return cjkFontCache;

    // If we have a Google Fonts subset cache, check character coverage
    if (cjkFontCache && cjkFontCoveredChars !== null) {
        const allCovered = texts.every(t =>
            [...t].every(ch => ch.charCodeAt(0) <= 0xFF || cjkFontCoveredChars!.has(ch))
        );
        if (allCovered) return cjkFontCache;
        // New characters needed — invalidate and re-fetch
        cjkFontCache = null;
        cjkFontCoveredChars = null;
        cjkFontPromise = null;
    }

    if (cjkFontPromise) return cjkFontPromise;

    cjkFontPromise = (async () => {
        // Strategy 1 & 2: CDN direct download (full font)
        for (const url of CJK_FONT_URLS) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const bytes = await response.arrayBuffer();
                    if (bytes.byteLength < 1000) {
                        console.warn(`[CJK Font] ${url} returned suspiciously small file (${bytes.byteLength} bytes), skipping`);
                        continue;
                    }
                    cjkFontCache = bytes;
                    cjkFontCoveredChars = null; // null = full font
                    console.info(`[CJK Font] Loaded Noto Sans TC (${(bytes.byteLength / 1024).toFixed(0)} KB) from ${url}`);
                    return bytes;
                }
                console.warn(`[CJK Font] ${url} responded ${response.status}`);
            } catch (err) {
                console.warn(`[CJK Font] Failed to fetch ${url}:`, err);
                continue;
            }
        }

        // Strategy 3: Google Fonts API — text-specific subset
        if (texts.length > 0) {
            try {
                const bytes = await loadCjkFontFromGoogleFonts(texts);
                cjkFontCache = bytes;
                return bytes;
            } catch (err) {
                console.warn('[CJK Font] Google Fonts API fallback failed:', err);
            }
        }

        throw new Error(
            '無法載入中文字型（Noto Sans TC），請確認網路連線後重試。'
        );
    })();

    try {
        return await cjkFontPromise;
    } catch (error) {
        cjkFontPromise = null; // Allow retry on next call
        throw error;
    }
}
