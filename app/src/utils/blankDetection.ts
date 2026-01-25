import type { PositionConfig, PositionName, DetectionResult, LogoPosition } from '../types';

// Position priority order (as specified in PRD)
export const POSITION_PRIORITY: PositionConfig[] = [
    { name: 'right-bottom', xRatio: 0.75, yRatio: 0.85 },
    { name: 'right-top', xRatio: 0.75, yRatio: 0.05 },
    { name: 'left-bottom', xRatio: 0.05, yRatio: 0.85 },
    { name: 'left-top', xRatio: 0.05, yRatio: 0.05 },
];

// Margin around logo (in pixels at render scale)
const LOGO_MARGIN = 15;

// Analyze if an area is blank, light, or occupied
function analyzePixelArea(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
): 'blank' | 'light' | 'occupied' {
    // Ensure coordinates are within canvas bounds
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    const safeX = Math.max(0, Math.min(x, canvasWidth - 1));
    const safeY = Math.max(0, Math.min(y, canvasHeight - 1));
    const safeWidth = Math.min(width, canvasWidth - safeX);
    const safeHeight = Math.min(height, canvasHeight - safeY);

    if (safeWidth <= 0 || safeHeight <= 0) {
        return 'occupied';
    }

    const imageData = ctx.getImageData(safeX, safeY, safeWidth, safeHeight);
    const pixels = imageData.data;

    let whitePixels = 0;
    let lightPixels = 0;
    const totalPixels = (safeWidth * safeHeight);

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Complete white/blank (RGB > 240)
        if (r > 240 && g > 240 && b > 240) {
            whitePixels++;
        }
        // Light background acceptable (RGB > 220)
        else if (r > 220 && g > 220 && b > 220) {
            lightPixels++;
        }
    }

    const whiteRatio = whitePixels / totalPixels;
    const lightRatio = (whitePixels + lightPixels) / totalPixels;

    if (whiteRatio > 0.95) return 'blank';
    if (lightRatio > 0.90) return 'light';
    return 'occupied';
}

// Detect best logo position on a page
export function detectLogoPosition(
    canvas: HTMLCanvasElement,
    logoWidth: number,
    logoHeight: number,
    preferredPosition?: PositionName
): DetectionResult {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Cannot get canvas context');
    }

    const pageWidth = canvas.width;
    const pageHeight = canvas.height;

    // Size with margin
    const areaWidth = logoWidth + LOGO_MARGIN * 2;
    const areaHeight = logoHeight + LOGO_MARGIN * 2;

    // Reorder positions if preferred position is specified
    let positions = [...POSITION_PRIORITY];
    if (preferredPosition) {
        const preferredIndex = positions.findIndex(p => p.name === preferredPosition);
        if (preferredIndex > 0) {
            const [preferred] = positions.splice(preferredIndex, 1);
            positions.unshift(preferred);
        }
    }

    // Try each position
    for (const pos of positions) {
        const x = Math.floor(pos.xRatio * pageWidth - areaWidth / 2);
        const y = Math.floor(pos.yRatio * pageHeight - areaHeight / 2);

        // Ensure within bounds
        const safeX = Math.max(LOGO_MARGIN, Math.min(x, pageWidth - areaWidth - LOGO_MARGIN));
        const safeY = Math.max(LOGO_MARGIN, Math.min(y, pageHeight - areaHeight - LOGO_MARGIN));

        const status = analyzePixelArea(ctx, safeX, safeY, areaWidth, areaHeight);

        if (status === 'blank' || status === 'light') {
            return {
                pageNumber: 0, // Will be set by caller
                position: {
                    x: safeX + LOGO_MARGIN,
                    y: safeY + LOGO_MARGIN,
                    width: logoWidth,
                    height: logoHeight,
                },
                status,
                positionName: pos.name,
            };
        }
    }

    // No suitable position found, return first position with 'occupied' status
    const defaultPos = positions[0];
    const x = Math.floor(defaultPos.xRatio * pageWidth - logoWidth / 2);
    const y = Math.floor(defaultPos.yRatio * pageHeight - logoHeight / 2);

    return {
        pageNumber: 0,
        position: {
            x: Math.max(LOGO_MARGIN, Math.min(x, pageWidth - logoWidth - LOGO_MARGIN)),
            y: Math.max(LOGO_MARGIN, Math.min(y, pageHeight - logoHeight - LOGO_MARGIN)),
            width: logoWidth,
            height: logoHeight,
        },
        status: 'occupied',
        positionName: defaultPos.name,
    };
}

// Calculate logo dimensions maintaining aspect ratio
export function calculateLogoDimensions(
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

// Get logo dimensions from image bytes
export async function getImageDimensions(
    imageBytes: ArrayBuffer
): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([imageBytes]);
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

// Constrain position within page bounds
export function constrainPosition(
    position: LogoPosition,
    pageWidth: number,
    pageHeight: number
): LogoPosition {
    return {
        ...position,
        x: Math.max(0, Math.min(position.x, pageWidth - position.width)),
        y: Math.max(0, Math.min(position.y, pageHeight - position.height)),
    };
}
