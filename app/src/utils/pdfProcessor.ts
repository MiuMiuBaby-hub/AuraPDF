import { PDFDocument } from 'pdf-lib';
import type { ProcessedPage } from '../types';
import { getRenderScale } from './pdfUtils';

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

// Process PDF and add logos to each page
export async function processPdfWithLogos(
    pdfBytes: ArrayBuffer,
    logoBytes: ArrayBuffer,
    logoMimeType: string,
    processedPages: ProcessedPage[]
): Promise<Uint8Array> {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Handle SVG conversion
    let finalLogoBytes = logoBytes;
    let finalMimeType = logoMimeType;

    if (logoMimeType.includes('svg')) {
        finalLogoBytes = await convertSvgToPng(logoBytes);
        finalMimeType = 'image/png';
    }

    // Embed the logo image
    let logoImage;
    if (finalMimeType.includes('png')) {
        logoImage = await pdfDoc.embedPng(finalLogoBytes);
    } else if (finalMimeType.includes('jpeg') || finalMimeType.includes('jpg')) {
        logoImage = await pdfDoc.embedJpg(finalLogoBytes);
    } else {
        // For other formats, try PNG first
        try {
            logoImage = await pdfDoc.embedPng(finalLogoBytes);
        } catch {
            logoImage = await pdfDoc.embedJpg(finalLogoBytes);
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

        // Convert from canvas coordinates to PDF coordinates
        // Canvas origin is top-left, PDF origin is bottom-left
        const pdfX = position.x / renderScale;
        const pdfY = pageHeight - (position.y / renderScale) - (position.height / renderScale);
        const pdfWidth = position.width / renderScale;
        const pdfHeight = position.height / renderScale;

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
