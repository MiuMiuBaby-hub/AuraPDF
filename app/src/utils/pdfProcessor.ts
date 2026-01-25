import { PDFDocument } from 'pdf-lib';
import type { ProcessedPage } from '../types';
import { getRenderScale } from './pdfUtils';

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
    logoDimensions?: { width: number; height: number }
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

    // Collect all unique opacity values needed
    const opacitySet = new Set<number>();
    for (const processedPage of processedPages) {
        if (!processedPage.skipLogo) {
            const pageOpacity = processedPage.logoOpacity ?? logoOpacity;
            opacitySet.add(pageOpacity);
        }
    }

    // Create logo images for each unique opacity
    const logoImageMap = new Map<number, Awaited<ReturnType<typeof pdfDoc.embedPng>>>();

    for (const opacity of opacitySet) {
        let finalLogoBytes = baseLogoBytes;

        if (opacity < 100) {
            // Convert to PNG if needed before applying opacity
            if (!baseMimeType.includes('png')) {
                finalLogoBytes = await convertToPng(baseLogoBytes, baseMimeType);
            }
            finalLogoBytes = await applyOpacityToImage(finalLogoBytes, opacity);
            const logoImage = await pdfDoc.embedPng(finalLogoBytes);
            logoImageMap.set(opacity, logoImage);
        } else {
            // 100% opacity - use original format
            let logoImage;
            if (baseMimeType.includes('png')) {
                logoImage = await pdfDoc.embedPng(finalLogoBytes);
            } else if (baseMimeType.includes('jpeg') || baseMimeType.includes('jpg')) {
                logoImage = await pdfDoc.embedJpg(finalLogoBytes);
            } else {
                try {
                    logoImage = await pdfDoc.embedPng(finalLogoBytes);
                } catch {
                    logoImage = await pdfDoc.embedJpg(finalLogoBytes);
                }
            }
            logoImageMap.set(opacity, logoImage);
        }
    }

    const renderScale = getRenderScale();

    // Add logo to each page
    for (const processedPage of processedPages) {
        // Skip if user chose to skip this page
        if (processedPage.skipLogo) continue;

        const pageIndex = processedPage.pageNumber - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { height: pageHeight } = page.getSize();

        // Get position (use manual position if set, otherwise detection result)
        const position = processedPage.manualPosition || processedPage.detection.position;

        // Get the appropriate logo image for this page's opacity
        const pageOpacity = processedPage.logoOpacity ?? logoOpacity;
        const logoImage = logoImageMap.get(pageOpacity);
        if (!logoImage) continue;

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

        // Convert from canvas coordinates to PDF coordinates
        // Canvas origin is top-left, PDF origin is bottom-left
        const pdfX = position.x / renderScale;
        const pdfY = pageHeight - (position.y / renderScale) - (logoDims.height / renderScale);
        const pdfWidth = logoDims.width / renderScale;
        const pdfHeight = logoDims.height / renderScale;

        // Draw the logo
        page.drawImage(logoImage, {
            x: pdfX,
            y: pdfY,
            width: pdfWidth,
            height: pdfHeight,
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
