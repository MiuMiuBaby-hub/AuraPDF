import type { PositionConfig, PositionName, DetectionResult, LogoPosition } from '../types';

// All available positions with their coordinates
export const ALL_POSITIONS: PositionConfig[] = [
    // Corners
    { name: 'right-bottom', xRatio: 0.85, yRatio: 0.90 },
    { name: 'right-top', xRatio: 0.85, yRatio: 0.10 },
    { name: 'left-bottom', xRatio: 0.15, yRatio: 0.90 },
    { name: 'left-top', xRatio: 0.15, yRatio: 0.10 },
    // Center
    { name: 'center', xRatio: 0.50, yRatio: 0.50 },
    // Edge centers
    { name: 'top-center', xRatio: 0.50, yRatio: 0.10 },
    { name: 'bottom-center', xRatio: 0.50, yRatio: 0.90 },
    { name: 'left-center', xRatio: 0.15, yRatio: 0.50 },
    { name: 'right-center', xRatio: 0.85, yRatio: 0.50 },
];

// Default position priority order (as specified in PRD)
export const POSITION_PRIORITY: PositionConfig[] = [
    ALL_POSITIONS[0], // right-bottom
    ALL_POSITIONS[1], // right-top
    ALL_POSITIONS[2], // left-bottom
    ALL_POSITIONS[3], // left-top
];

// Get position config by name
export function getPositionConfig(name: PositionName): PositionConfig {
    return ALL_POSITIONS.find(p => p.name === name) || ALL_POSITIONS[0];
}

// Position display names (Chinese)
export const POSITION_LABELS: Record<PositionName, string> = {
    'right-bottom': '右下角',
    'right-top': '右上角',
    'left-bottom': '左下角',
    'left-top': '左上角',
    'center': '中央',
    'top-center': '上方中間',
    'bottom-center': '下方中間',
    'left-center': '左側中間',
    'right-center': '右側中間',
};

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
    if (lightRatio > 0.85) return 'light';  // 調嚴：90% → 85%
    return 'occupied';
}

// Detect best logo position on a page
export function detectLogoPosition(
    canvas: HTMLCanvasElement,
    logoWidth: number,
    logoHeight: number,
    preferredPosition?: PositionName,
    autoFallback?: boolean,
    fallbackPriority?: PositionName[]
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

    // Helper function to calculate position and status
    const calculatePosition = (pos: PositionConfig): { position: LogoPosition; status: 'blank' | 'light' | 'occupied' } => {
        const x = Math.floor(pos.xRatio * pageWidth - areaWidth / 2);
        const y = Math.floor(pos.yRatio * pageHeight - areaHeight / 2);

        // Ensure within bounds
        const safeX = Math.max(LOGO_MARGIN, Math.min(x, pageWidth - areaWidth - LOGO_MARGIN));
        const safeY = Math.max(LOGO_MARGIN, Math.min(y, pageHeight - areaHeight - LOGO_MARGIN));

        const status = analyzePixelArea(ctx, safeX, safeY, areaWidth, areaHeight);

        return {
            position: {
                x: safeX + LOGO_MARGIN,
                y: safeY + LOGO_MARGIN,
                width: logoWidth,
                height: logoHeight,
            },
            status,
        };
    };

    // If user specified a preferred position, use it (with optional fallback)
    if (preferredPosition) {
        const preferredConfig = getPositionConfig(preferredPosition);
        const { position, status } = calculatePosition(preferredConfig);

        // 若開啟自動遞補，且指定位置非空白，依 fallbackPriority 順序嘗試其他位置
        if (autoFallback && status !== 'blank' && fallbackPriority) {
            // 第一輪：只找完全空白的位置
            for (const posName of fallbackPriority) {
                if (posName === preferredPosition) continue;
                const posConfig = getPositionConfig(posName);
                const alt = calculatePosition(posConfig);
                if (alt.status === 'blank') {
                    return {
                        pageNumber: 0,
                        position: alt.position,
                        status: alt.status,
                        positionName: posName,
                    };
                }
            }
            // 第二輪：若無空白，放寬接受 light
            for (const posName of fallbackPriority) {
                if (posName === preferredPosition) continue;
                const posConfig = getPositionConfig(posName);
                const alt = calculatePosition(posConfig);
                if (alt.status === 'light') {
                    return {
                        pageNumber: 0,
                        position: alt.position,
                        status: alt.status,
                        positionName: posName,
                    };
                }
            }
        }

        return {
            pageNumber: 0,
            position,
            status,
            positionName: preferredPosition,
        };
    }

    // No preferred position: use automatic detection
    // 第一輪：只找完全空白的位置
    for (const pos of POSITION_PRIORITY) {
        const { position, status } = calculatePosition(pos);
        if (status === 'blank') {
            return {
                pageNumber: 0,
                position,
                status,
                positionName: pos.name,
            };
        }
    }
    // 第二輪：若無空白，放寬接受 light
    for (const pos of POSITION_PRIORITY) {
        const { position, status } = calculatePosition(pos);
        if (status === 'light') {
            return {
                pageNumber: 0,
                position,
                status,
                positionName: pos.name,
            };
        }
    }

    // No suitable position found, return first position with 'occupied' status
    const defaultPos = POSITION_PRIORITY[0];
    const { position, status } = calculatePosition(defaultPos);

    return {
        pageNumber: 0,
        position,
        status,
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
