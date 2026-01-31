import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib-plus-encrypt';
import fontkit from '@pdf-lib/fontkit';
import type { ProcessedPage, SecuritySettings, WatermarkSettings, WatermarkFontFamily, HeaderFooterSettings, HeaderFooterRow } from '../types';
import { getRenderScale } from './pdfUtils';
import { containsNonWinAnsiChars, loadCjkFont } from './fontLoader';

// Get page rotation angle
function getPageRotation(page: ReturnType<PDFDocument['getPage']>): number {
    try {
        return page.getRotation().angle;
    } catch {
        return 0;
    }
}

// Transform canvas coordinates to PDF coordinates
// Canvas: origin at top-left, Y increases downward
// PDF: origin at bottom-left, Y increases upward
function transformCanvasToPdf(
    canvasX: number,
    canvasY: number,
    logoWidth: number,
    logoHeight: number,
    originalPdfWidth: number,
    originalPdfHeight: number,
    rotation: number,
    renderScale: number
): { x: number; y: number; width: number; height: number } {
    // Logo dimensions in PDF units (NEVER swap these)
    const pdfLogoWidth = logoWidth / renderScale;
    const pdfLogoHeight = logoHeight / renderScale;

    // Effective dimensions after rotation (this is what the canvas is based on)
    const isRotated = (rotation === 90 || rotation === 270);
    const effectiveWidth = isRotated ? originalPdfHeight : originalPdfWidth;
    const effectiveHeight = isRotated ? originalPdfWidth : originalPdfHeight;

    // Normalize position to [0, 1] range based on effective (displayed) dimensions
    const normX = canvasX / (effectiveWidth * renderScale);
    const normY = canvasY / (effectiveHeight * renderScale);

    let pdfX: number, pdfY: number;

    switch (rotation) {
        case 90: {
            // 90° CW: display X→pdfY, display Y→pdfX
            // Logo's display top-left at (normX, normY) maps to PDF (pdfX, pdfY)
            pdfX = normY * originalPdfWidth;
            pdfY = normX * originalPdfHeight;
            break;
        }
        case 180: {
            // 180°: both axes flipped
            pdfX = (1 - normX) * originalPdfWidth - pdfLogoWidth;
            pdfY = (1 - normY) * originalPdfHeight - pdfLogoHeight;
            break;
        }
        case 270: {
            // 270° CW (= 90° CCW)
            pdfX = (1 - normY) * originalPdfWidth - pdfLogoWidth;
            pdfY = normX * originalPdfHeight;
            break;
        }
        case 0:
        default: {
            // No rotation: X same, Y flipped (canvas top→PDF top means high PDF Y)
            pdfX = normX * originalPdfWidth;
            pdfY = (1 - normY) * originalPdfHeight - pdfLogoHeight;
            break;
        }
    }

    return {
        x: pdfX,
        y: pdfY,
        width: pdfLogoWidth,
        height: pdfLogoHeight
    };
}

// Rotate an image by the given angle (in degrees, counter-clockwise) using canvas
// This is used to pre-rotate the logo so it appears upright on rotated PDF pages
async function rotateImage(
    imageBytes: ArrayBuffer,
    angleDegrees: number
): Promise<{ bytes: ArrayBuffer; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([imageBytes], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const radians = (angleDegrees * Math.PI) / 180;

            // For 90° or 270° rotation, swap canvas dimensions
            const swap = (angleDegrees === 90 || angleDegrees === 270);
            canvas.width = swap ? img.height : img.width;
            canvas.height = swap ? img.width : img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('無法創建 Canvas'));
                return;
            }

            // Move to center, rotate, draw, move back
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(radians);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                if (blob) {
                    blob.arrayBuffer().then(buf => resolve({
                        bytes: buf,
                        width: canvas.width,
                        height: canvas.height,
                    })).catch(reject);
                } else {
                    reject(new Error('圖片旋轉失敗'));
                }
            }, 'image/png');
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('圖片載入失敗'));
        };

        img.src = url;
    });
}

// Apply opacity to an image using canvas
async function applyOpacityToImage(
    imageBytes: ArrayBuffer,
    opacity: number
): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([imageBytes], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('無法創建 Canvas'));
                return;
            }

            ctx.globalAlpha = opacity / 100;
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                if (blob) {
                    blob.arrayBuffer().then(resolve).catch(reject);
                } else {
                    reject(new Error('透明度應用失敗'));
                }
            }, 'image/png');
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('圖片載入失敗'));
        };

        img.src = url;
    });
}

// Convert SVG to PNG using canvas
async function convertSvgToPng(svgBytes: ArrayBuffer): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([svgBytes], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Use a reasonable size for SVG rendering
            const scale = 2;
            canvas.width = img.width * scale || 200;
            canvas.height = img.height * scale || 200;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('無法創建 Canvas'));
                return;
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                if (blob) {
                    blob.arrayBuffer().then(resolve).catch(reject);
                } else {
                    reject(new Error('SVG 轉換失敗'));
                }
            }, 'image/png');
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('SVG 載入失敗'));
        };

        img.src = url;
    });
}

// Convert image to PNG format
async function convertToPng(imageBytes: ArrayBuffer, mimeType: string): Promise<ArrayBuffer> {
    if (mimeType.includes('png')) {
        return imageBytes;
    }

    const tempBlob = new Blob([imageBytes], { type: mimeType });
    const tempUrl = URL.createObjectURL(tempBlob);
    const tempImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = tempUrl;
    });
    URL.revokeObjectURL(tempUrl);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tempImg.width;
    tempCanvas.height = tempImg.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
        throw new Error('無法創建 Canvas');
    }

    tempCtx.drawImage(tempImg, 0, 0);
    const blob = await new Promise<Blob | null>(resolve =>
        tempCanvas.toBlob(resolve, 'image/png')
    );
    if (!blob) {
        throw new Error('PNG 轉換失敗');
    }

    return blob.arrayBuffer();
}

// Calculate logo dimensions maintaining aspect ratio
function calculateLogoDimensions(
    originalWidth: number,
    originalHeight: number,
    targetSize: number
): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    if (aspectRatio >= 1) {
        // Landscape or square
        return {
            width: targetSize,
            height: Math.round(targetSize / aspectRatio),
        };
    } else {
        // Portrait
        return {
            width: Math.round(targetSize * aspectRatio),
            height: targetSize,
        };
    }
}

// ============================================
// 浮水印繪製功能
// ============================================

// 解析 hex 顏色為 RGB (0-1 範圍)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
    } : { r: 0.5, g: 0.5, b: 0.5 };
}

// 取得 pdf-lib 標準字型
async function getStandardFont(
    pdfDoc: PDFDocument,
    fontFamily: WatermarkFontFamily
) {
    switch (fontFamily) {
        case 'Times-Roman':
            return pdfDoc.embedFont(StandardFonts.TimesRoman);
        case 'Courier':
            return pdfDoc.embedFont(StandardFonts.Courier);
        case 'Helvetica':
        default:
            return pdfDoc.embedFont(StandardFonts.Helvetica);
    }
}

// 計算浮水印位置（支援單點和平鋪）
function calculateWatermarkPositions(
    watermark: WatermarkSettings,
    pageWidth: number,
    pageHeight: number,
    textWidth: number,
    textHeight: number
): Array<{ x: number; y: number }> {
    const margin = 50;

    if (watermark.position === 'tile' && watermark.tileSettings) {
        // 平鋪模式
        const { horizontalSpacing, verticalSpacing, offsetAlternateRows } = watermark.tileSettings;
        const positions: Array<{ x: number; y: number }> = [];

        // 計算需要多少行/列（加上額外的以覆蓋旋轉後的邊緣）
        const extraMargin = Math.max(textWidth, textHeight);
        const startX = -extraMargin;
        const startY = -extraMargin;
        const endX = pageWidth + extraMargin;
        const endY = pageHeight + extraMargin;

        let row = 0;
        for (let y = startY; y < endY; y += verticalSpacing) {
            const offsetX = (offsetAlternateRows && row % 2 === 1) ? horizontalSpacing / 2 : 0;
            for (let x = startX + offsetX; x < endX; x += horizontalSpacing) {
                positions.push({ x, y });
            }
            row++;
        }

        // 限制最大數量以避免效能問題
        return positions.slice(0, 200);
    }

    // 單點模式
    let x: number, y: number;
    switch (watermark.position) {
        case 'top-left':
            x = margin;
            y = pageHeight - margin - textHeight;
            break;
        case 'top-right':
            x = pageWidth - textWidth - margin;
            y = pageHeight - margin - textHeight;
            break;
        case 'bottom-left':
            x = margin;
            y = margin;
            break;
        case 'bottom-right':
            x = pageWidth - textWidth - margin;
            y = margin;
            break;
        case 'center':
        default:
            x = (pageWidth - textWidth) / 2;
            y = (pageHeight - textHeight) / 2;
            break;
    }

    return [{ x, y }];
}

// 在頁面上繪製浮水印
async function drawWatermarkOnPage(
    page: ReturnType<PDFDocument['getPage']>,
    watermark: WatermarkSettings,
    font: Awaited<ReturnType<PDFDocument['embedFont']>>
) {
    const { width, height } = page.getSize();
    const rotation = getPageRotation(page);

    // For rotated pages, use the effective (displayed) dimensions
    const isRotated = (rotation === 90 || rotation === 270);
    const effectiveWidth = isRotated ? height : width;
    const effectiveHeight = isRotated ? width : height;

    const { r, g, b } = hexToRgb(watermark.color);
    const textWidth = font.widthOfTextAtSize(watermark.text, watermark.fontSize);
    const textHeight = watermark.fontSize;

    // 計算所有浮水印位置（基於有效顯示尺寸）
    const positions = calculateWatermarkPositions(
        watermark,
        effectiveWidth,
        effectiveHeight,
        textWidth,
        textHeight
    );

    console.info(`[Watermark] Page: ${width}x${height}, rotation=${rotation}, effective=${effectiveWidth}x${effectiveHeight}, positions=${positions.length}`);

    // 繪製每個浮水印
    for (const pos of positions) {
        // Transform visual (effective) coordinates → MediaBox coordinates.
        // pdf-lib drawText operates in raw MediaBox space; the viewer applies /Rotate afterwards.
        // These formulas match drawHeaderFooterRowOnPage.
        let drawX = pos.x;
        let drawY = pos.y;

        switch (rotation) {
            case 90:
                // Visual (vx, vy) → MediaBox (W - vy, vx)
                drawX = width - pos.y;
                drawY = pos.x;
                break;
            case 180:
                // Visual (vx, vy) → MediaBox (W - vx, H - vy)
                drawX = effectiveWidth - pos.x;
                drawY = effectiveHeight - pos.y;
                break;
            case 270:
                // Visual (vx, vy) → MediaBox (vy, H - vx)
                drawX = pos.y;
                drawY = height - pos.x;
                break;
            case 0:
            default:
                // No rotation: MediaBox = visual
                break;
        }

        page.drawText(watermark.text, {
            x: drawX,
            y: drawY,
            size: watermark.fontSize,
            font,
            color: rgb(r, g, b),
            opacity: watermark.opacity / 100,
            // Counter-rotate text by page rotation so it appears at the configured
            // visual angle after the viewer applies /Rotate.
            rotate: degrees(watermark.rotation + rotation),
        });
    }
}

// ============================================
// 頁首/頁尾繪製功能
// ============================================

// 替換頁首/頁尾文字中的變數
function replaceHeaderFooterVariables(
    text: string,
    pageNumber: number,
    totalPages: number,
    fileName: string
): string {
    const dateString = new Date().toLocaleDateString('zh-TW');
    const titleString = fileName.replace(/\.pdf$/i, '');

    return text
        .replace(/\{page\}/g, String(pageNumber))
        .replace(/\{total\}/g, String(totalPages))
        .replace(/\{date\}/g, dateString)
        .replace(/\{title\}/g, titleString);
}

// 在頁面上繪製頁首或頁尾（支援旋轉頁面）
function drawHeaderFooterRowOnPage(
    page: ReturnType<PDFDocument['getPage']>,
    row: HeaderFooterRow,
    isHeader: boolean,
    standardFont: Awaited<ReturnType<PDFDocument['embedFont']>>,
    cjkFont: Awaited<ReturnType<PDFDocument['embedFont']>> | null,
    pageNumber: number,
    totalPages: number,
    fileName: string
) {
    if (!row.enabled) return;

    // getSize() returns raw MediaBox dimensions (unrotated)
    const { width: W, height: H } = page.getSize();
    const rotation = getPageRotation(page);
    const { r, g, b } = hexToRgb(row.color);

    // Effective (visual) dimensions after viewer rotation
    const isRotated = (rotation === 90 || rotation === 270);
    const effectiveW = isRotated ? H : W;
    const effectiveH = isRotated ? W : H;

    // Desired Y in visual (display) space
    const visY = isHeader
        ? effectiveH - row.margin  // 頁首：視覺頂部
        : row.margin;              // 頁尾：視覺底部

    // 繪製三個區塊
    const blocks: Array<{ block: typeof row.left; alignment: 'left' | 'center' | 'right' }> = [
        { block: row.left, alignment: 'left' },
        { block: row.center, alignment: 'center' },
        { block: row.right, alignment: 'right' },
    ];

    for (const { block, alignment } of blocks) {
        if (!block.enabled || !block.text.trim()) continue;

        const processedText = replaceHeaderFooterVariables(
            block.text,
            pageNumber,
            totalPages,
            fileName
        );

        // Pick CJK font if processed text contains non-WinAnsi characters
        const font = (cjkFont && containsNonWinAnsiChars(processedText))
            ? cjkFont
            : standardFont;

        const textWidth = font.widthOfTextAtSize(processedText, row.fontSize);

        // Desired X in visual (display) space
        let visX: number;
        switch (alignment) {
            case 'left':
                visX = row.margin;
                break;
            case 'center':
                visX = (effectiveW - textWidth) / 2;
                break;
            case 'right':
                visX = effectiveW - textWidth - row.margin;
                break;
        }

        // Transform visual coordinates → PDF (unrotated MediaBox) coordinates
        // pdf-lib-plus-encrypt drawText operates in raw MediaBox space;
        // the viewer applies /Rotate afterwards.
        let pdfX: number, pdfY: number;
        switch (rotation) {
            case 90:
                pdfX = W - visY;
                pdfY = visX;
                break;
            case 180:
                pdfX = W - visX;
                pdfY = H - visY;
                break;
            case 270:
                pdfX = visY;
                pdfY = H - visX;
                break;
            default:
                pdfX = visX;
                pdfY = visY;
                break;
        }

        page.drawText(processedText, {
            x: pdfX,
            y: pdfY,
            size: row.fontSize,
            font,
            color: rgb(r, g, b),
            // Counter-rotate text so it appears horizontal after viewer rotation
            ...(rotation !== 0 ? { rotate: degrees(rotation) } : {}),
        });
    }
}

// 在頁面上繪製頁首和頁尾
async function drawHeaderFooterOnPage(
    page: ReturnType<PDFDocument['getPage']>,
    headerFooter: HeaderFooterSettings,
    headerFont: Awaited<ReturnType<PDFDocument['embedFont']>>,
    footerFont: Awaited<ReturnType<PDFDocument['embedFont']>>,
    cjkFont: Awaited<ReturnType<PDFDocument['embedFont']>> | null,
    pageNumber: number,
    totalPages: number,
    fileName: string
) {
    // 繪製頁首
    drawHeaderFooterRowOnPage(
        page,
        headerFooter.header,
        true,
        headerFont,
        cjkFont,
        pageNumber,
        totalPages,
        fileName
    );

    // 繪製頁尾
    drawHeaderFooterRowOnPage(
        page,
        headerFooter.footer,
        false,
        footerFont,
        cjkFont,
        pageNumber,
        totalPages,
        fileName
    );
}

// Process PDF and add logos/watermarks to each page
export async function processPdfWithLogos(
    pdfBytes: ArrayBuffer,
    logoBytes: ArrayBuffer | null,
    logoMimeType: string | null,
    processedPages: ProcessedPage[],
    logoOpacity: number = 100,
    logoDimensions?: { width: number; height: number },
    security?: SecuritySettings,
    watermark?: WatermarkSettings,
    headerFooter?: HeaderFooterSettings,
    fileName: string = 'document.pdf'
): Promise<Uint8Array> {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    // Collect all text that will be rendered to detect CJK characters
    const textsToCheck: string[] = [];
    if (watermark?.enabled && watermark.text.trim()) {
        textsToCheck.push(watermark.text);
    }
    if (headerFooter) {
        for (const row of [headerFooter.header, headerFooter.footer]) {
            if (row.enabled) {
                for (const pos of ['left', 'center', 'right'] as const) {
                    if (row[pos].enabled && row[pos].text.trim()) {
                        textsToCheck.push(row[pos].text);
                    }
                }
            }
        }
        // Also check filename ({title}) and date format ({date})
        textsToCheck.push(fileName);
        textsToCheck.push(new Date().toLocaleDateString('zh-TW'));
    }

    // Load CJK font if any text contains non-WinAnsi characters,
    // or if user explicitly selected 'Noto Sans TC' font.
    const needsCjkFont = textsToCheck.some(containsNonWinAnsiChars)
        || watermark?.fontFamily === 'Noto Sans TC';
    let cjkFont: Awaited<ReturnType<PDFDocument['embedFont']>> | null = null;
    if (needsCjkFont) {
        pdfDoc.registerFontkit(fontkit);
        const cjkFontBytes = await loadCjkFont(textsToCheck);
        console.info(`[Watermark] CJK font loaded: ${cjkFontBytes.byteLength} bytes`);
        // Use subset: false — fontkit v1.x subsetting can corrupt CJK glyphs
        cjkFont = await pdfDoc.embedFont(cjkFontBytes, { subset: false });
    }

    // 1. 處理浮水印（先於 Logo，作為背景層）
    if (watermark?.enabled && watermark.text.trim()) {
        const usesCjk = containsNonWinAnsiChars(watermark.text) || watermark.fontFamily === 'Noto Sans TC';
        const font = (cjkFont && usesCjk)
            ? cjkFont
            : await getStandardFont(pdfDoc, watermark.fontFamily);
        console.info(`[Watermark] Drawing "${watermark.text}" on ${pages.length} pages, font=${usesCjk ? 'CJK' : watermark.fontFamily}, size=${watermark.fontSize}, opacity=${watermark.opacity}%`);
        for (const page of pages) {
            await drawWatermarkOnPage(page, watermark, font);
        }
    } else {
        console.info(`[Watermark] Skipped: enabled=${watermark?.enabled}, text="${watermark?.text}"`);
    }

    // 2. 處理頁首/頁尾（浮水印之後，Logo 之前）
    if (headerFooter && (headerFooter.header.enabled || headerFooter.footer.enabled)) {
        // 分別載入頁首和頁尾的字體（可能不同）
        const headerFont = headerFooter.header.enabled
            ? await getStandardFont(pdfDoc, headerFooter.header.fontFamily)
            : await getStandardFont(pdfDoc, 'Helvetica');
        const footerFont = headerFooter.footer.enabled
            ? await getStandardFont(pdfDoc, headerFooter.footer.fontFamily)
            : await getStandardFont(pdfDoc, 'Helvetica');

        for (let i = 0; i < pages.length; i++) {
            await drawHeaderFooterOnPage(
                pages[i],
                headerFooter,
                headerFont,
                footerFont,
                cjkFont,
                i + 1,        // pageNumber (1-based)
                totalPages,
                fileName
            );
        }
    }

    // 3. 處理 Logo（如果有提供）
    if (!logoBytes || !logoMimeType) {
        // 沒有 Logo，只套用加密後返回
        if (security?.enabled && (security.userPassword || security.ownerPassword)) {
            const userPwd = security.userPassword || security.ownerPassword || 'user';
            const ownerPwd = security.ownerPassword || security.userPassword || 'owner';
            await pdfDoc.encrypt({
                userPassword: userPwd,
                ownerPassword: ownerPwd,
                permissions: {
                    printing: security.permissions.printing,
                    copying: security.permissions.copying,
                    modifying: security.permissions.modifying,
                    annotating: security.permissions.annotating,
                }
            });
        }
        return await pdfDoc.save();
    }

    // Handle SVG conversion
    let baseLogoBytes = logoBytes;
    let baseMimeType = logoMimeType;

    if (logoMimeType.includes('svg')) {
        baseLogoBytes = await convertSvgToPng(logoBytes);
        baseMimeType = 'image/png';
    }

    // Ensure base logo is PNG for rotation/opacity operations
    let basePngBytes = baseLogoBytes;
    if (!baseMimeType.includes('png')) {
        basePngBytes = await convertToPng(baseLogoBytes, baseMimeType);
    }

    // Cache for embedded logo images keyed by "rotation:opacity"
    const logoImageCache = new Map<string, Awaited<ReturnType<typeof pdfDoc.embedPng>>>();

    // Helper: get or create a logo image for a specific rotation and opacity
    async function getLogoImage(rotation: number, opacity: number) {
        const cacheKey = `${rotation}:${opacity}`;
        const cached = logoImageCache.get(cacheKey);
        if (cached) return cached;

        let logoBytes = basePngBytes;

        // Pre-rotate logo to counter the page rotation
        // This ensures the logo appears upright when the page is displayed
        if (rotation !== 0) {
            // Rotate in the opposite direction to cancel out the page rotation
            const counterRotation = (360 - rotation) % 360;
            const rotated = await rotateImage(logoBytes, counterRotation);
            logoBytes = rotated.bytes;
        }

        // Apply opacity if needed
        if (opacity < 100) {
            logoBytes = await applyOpacityToImage(logoBytes, opacity);
        }

        const logoImage = await pdfDoc.embedPng(logoBytes);
        logoImageCache.set(cacheKey, logoImage);
        return logoImage;
    }

    const renderScale = getRenderScale();

    // Add logo to each page
    for (const processedPage of processedPages) {
        // Skip if user chose to skip this page
        if (processedPage.skipLogo) continue;

        const pageIndex = processedPage.pageNumber - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { width: originalWidth, height: originalHeight } = page.getSize();
        const rotation = getPageRotation(page);

        // Get position (use manual position if set, otherwise detection result)
        const position = processedPage.manualPosition || processedPage.detection.position;

        // Get the appropriate logo image for this page's rotation and opacity
        const pageOpacity = processedPage.logoOpacity ?? logoOpacity;
        const logoImage = await getLogoImage(rotation, pageOpacity);

        // Calculate logo dimensions - recalculate if per-page logoSize is set
        let logoDims = { width: position.width, height: position.height };
        if (processedPage.logoSize !== undefined && logoDimensions) {
            // Recalculate dimensions based on per-page logo size
            logoDims = calculateLogoDimensions(
                logoDimensions.width,
                logoDimensions.height,
                processedPage.logoSize * renderScale
            );
        }

        // Transform canvas coordinates to PDF coordinates (handles rotation)
        const pdfRect = transformCanvasToPdf(
            position.x,
            position.y,
            logoDims.width,
            logoDims.height,
            originalWidth,
            originalHeight,
            rotation,
            renderScale
        );

        // For rotated pages, swap the draw dimensions since the logo image is pre-rotated
        const isRotated90or270 = (rotation === 90 || rotation === 270);
        const drawWidth = isRotated90or270 ? pdfRect.height : pdfRect.width;
        const drawHeight = isRotated90or270 ? pdfRect.width : pdfRect.height;

        // Draw the logo
        page.drawImage(logoImage, {
            x: pdfRect.x,
            y: pdfRect.y,
            width: drawWidth,
            height: drawHeight,
        });
    }

    // Apply encryption if security settings are enabled
    if (security?.enabled && (security.userPassword || security.ownerPassword)) {
        // pdf-lib-plus-encrypt requires userPassword, use ownerPassword as fallback
        const userPwd = security.userPassword || security.ownerPassword || 'user';
        const ownerPwd = security.ownerPassword || security.userPassword || 'owner';

        await pdfDoc.encrypt({
            userPassword: userPwd,
            ownerPassword: ownerPwd,
            permissions: {
                printing: security.permissions.printing,
                copying: security.permissions.copying,
                modifying: security.permissions.modifying,
                annotating: security.permissions.annotating,
            }
        });
    }

    // Save the modified PDF
    return await pdfDoc.save();
}

// Download the processed PDF
export function downloadPdf(
    pdfBytes: Uint8Array,
    originalFileName: string
): void {
    // Create filename with _with_logo suffix
    const baseName = originalFileName.replace(/\.pdf$/i, '');
    const newFileName = `${baseName}_with_logo.pdf`;

    // Create blob and download
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = newFileName;
    link.click();

    // Cleanup
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}
