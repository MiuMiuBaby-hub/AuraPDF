import * as pdfjsLib from 'pdfjs-dist';
import type { PageInfo } from '../types';

// Configure PDF.js worker - use unpkg CDN which has all versions
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Render scale for canvas (higher = better quality but slower)
const RENDER_SCALE = 1.5;
// Thumbnail scale for preview grid
const THUMBNAIL_SCALE = 0.5;

// Load PDF document and return page count
export async function loadPdfDocument(
    pdfBytes: ArrayBuffer
): Promise<pdfjsLib.PDFDocumentProxy> {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    return await loadingTask.promise;
}

// Render a PDF page to canvas
export async function renderPageToCanvas(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    scale: number = RENDER_SCALE
): Promise<HTMLCanvasElement> {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Cannot get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
        canvasContext: ctx,
        viewport,
    }).promise;

    return canvas;
}

// Render page as thumbnail
export async function renderPageThumbnail(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number
): Promise<HTMLCanvasElement> {
    return renderPageToCanvas(pdfDoc, pageNumber, THUMBNAIL_SCALE);
}

// Get all page info from PDF
export async function getPdfPageInfo(
    pdfDoc: pdfjsLib.PDFDocumentProxy
): Promise<PageInfo[]> {
    const pageInfos: PageInfo[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });

        pageInfos.push({
            pageNumber: i,
            width: viewport.width,
            height: viewport.height,
        });
    }

    return pageInfos;
}

// Validate PDF file
export async function validatePdfFile(
    file: File
): Promise<{ valid: boolean; error?: string; pageCount?: number }> {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        return { valid: false, error: '請上傳 PDF 格式的檔案' };
    }

    // Check file size (20MB limit)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        return { valid: false, error: '檔案大小不可超過 20MB' };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await loadPdfDocument(arrayBuffer);
        const pageCount = pdfDoc.numPages;

        // Check page count (100 page limit)
        if (pageCount > 100) {
            return { valid: false, error: '頁數不可超過 100 頁' };
        }

        return { valid: true, pageCount };
    } catch (err) {
        console.error('PDF loading error:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('password')) {
            return { valid: false, error: 'PDF 檔案已加密，請上傳未加密的檔案' };
        }
        return { valid: false, error: `PDF 檔案無法讀取：${errorMessage}` };
    }
}

// Get render scale
export function getRenderScale(): number {
    return RENDER_SCALE;
}

// Get thumbnail scale
export function getThumbnailScale(): number {
    return THUMBNAIL_SCALE;
}
