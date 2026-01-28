import { PDFDocument } from 'pdf-lib-plus-encrypt';
import type { ProcessedPage, SecuritySettings } from '../types';
import { getRenderScale } from './pdfUtils';

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

// Process PDF and add logos to each page
export async function processPdfWithLogos(
    pdfBytes: ArrayBuffer,
    logoBytes: ArrayBuffer,
    logoMimeType: string,
    processedPages: ProcessedPage[],
    logoOpacity: number = 100,
    logoDimensions?: { width: number; height: number },
    security?: SecuritySettings
): Promise<Uint8Array> {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

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
