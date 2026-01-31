import { useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { ProcessedPage, WatermarkSettings } from '../../types';

// Render scale used by pdfUtils to rasterise pages
const RENDER_SCALE = 1.5;

interface PageCardProps {
    page: ProcessedPage;
    logoPreviewUrl: string;
    logoOpacity: number;
    logoSize: number;
    onClick: () => void;
    isSelected?: boolean;
    watermark?: WatermarkSettings;
}

/**
 * Compute watermark positions that match the actual PDF rendering.
 *
 * Strategy: calculate in PDF point space (Y-up, origin bottom-left) — the
 * same formulas as calculateWatermarkPositions in pdfProcessor.ts — then
 * convert to SVG canvas pixels (Y-down, origin top-left).
 */
function computeWatermarkPositions(
    watermark: WatermarkSettings,
    cw: number,
    ch: number,
): Array<{ x: number; y: number }> {
    // PDF page dimensions in points
    const pageW = cw / RENDER_SCALE;
    const pageH = ch / RENDER_SCALE;
    const ptFontSize = watermark.fontSize;
    const ptMargin = 50;

    // Rough per-char width estimate in points (CJK ≈ 1em, Latin ≈ 0.6em)
    const ptTextW = watermark.text.split('').reduce(
        (sum, c) => sum + (c.charCodeAt(0) > 0xFF ? ptFontSize : ptFontSize * 0.6), 0,
    );
    const ptTextH = ptFontSize;

    // Calculate positions in PDF space (Y-up) — mirrors pdfProcessor.ts
    let pdfPositions: Array<{ x: number; y: number }>;

    if (watermark.position === 'tile' && watermark.tileSettings) {
        const { horizontalSpacing, verticalSpacing, offsetAlternateRows } = watermark.tileSettings;
        const extra = Math.max(ptTextW, ptTextH);
        pdfPositions = [];
        let row = 0;
        for (let y = -extra; y < pageH + extra; y += verticalSpacing) {
            const ox = (offsetAlternateRows && row % 2 === 1) ? horizontalSpacing / 2 : 0;
            for (let x = -extra + ox; x < pageW + extra; x += horizontalSpacing) {
                pdfPositions.push({ x, y });
            }
            row++;
        }
        pdfPositions = pdfPositions.slice(0, 200);
    } else {
        let x: number, y: number;
        switch (watermark.position) {
            case 'top-left':
                x = ptMargin;
                y = pageH - ptMargin - ptTextH;
                break;
            case 'top-right':
                x = pageW - ptTextW - ptMargin;
                y = pageH - ptMargin - ptTextH;
                break;
            case 'bottom-left':
                x = ptMargin;
                y = ptMargin;
                break;
            case 'bottom-right':
                x = pageW - ptTextW - ptMargin;
                y = ptMargin;
                break;
            case 'center':
            default:
                x = (pageW - ptTextW) / 2;
                y = (pageH - ptTextH) / 2;
                break;
        }
        pdfPositions = [{ x, y }];
    }

    // Convert PDF (Y-up, origin bottom-left) → SVG canvas (Y-down, origin top-left)
    return pdfPositions.map(({ x, y }) => ({
        x: x * RENDER_SCALE,
        y: (pageH - y) * RENDER_SCALE,
    }));
}

/** Map WatermarkFontFamily to CSS font-family with appropriate fallbacks. */
function cssFontFamily(fontFamily: WatermarkSettings['fontFamily']): string {
    switch (fontFamily) {
        case 'Noto Sans TC':
            return '"Noto Sans TC", "Microsoft JhengHei", sans-serif';
        case 'Times-Roman':
            return '"Times New Roman", serif';
        case 'Courier':
            return '"Courier New", monospace';
        case 'Helvetica':
        default:
            return 'Helvetica, Arial, sans-serif';
    }
}

export function PageCard({
    page,
    logoPreviewUrl,
    logoOpacity,
    logoSize,
    onClick,
    isSelected = false,
    watermark,
}: PageCardProps) {
    const { detection, skipLogo } = page;

    // 使用每頁設定或全局設定
    const effectiveOpacity = page.logoOpacity ?? logoOpacity;
    const effectiveSize = page.logoSize ?? logoSize;
    const hasCustomSettings = page.logoSize !== undefined || page.logoOpacity !== undefined;

    // Calculate size scale ratio for per-page logo size
    const sizeRatio = effectiveSize / logoSize;

    // Determine status color and icon
    const getStatusInfo = () => {
        if (skipLogo) {
            return {
                borderClass: 'border-gray-500',
                icon: null,
                label: '跳過',
            };
        }

        switch (detection.status) {
            case 'blank':
                return {
                    borderClass: 'status-success border-2',
                    icon: <CheckCircle className="w-4 h-4 text-green-400" />,
                    label: '完美位置',
                };
            case 'light':
                return {
                    borderClass: 'status-warning border-2',
                    icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
                    label: '需確認',
                };
            case 'occupied':
                return {
                    borderClass: 'status-error border-2',
                    icon: <XCircle className="w-4 h-4 text-red-400" />,
                    label: '需調整',
                };
        }
    };

    const statusInfo = getStatusInfo();

    // Calculate logo position relative to thumbnail
    const position = page.manualPosition || detection.position;
    const canvasWidth = page.canvas.width;
    const canvasHeight = page.canvas.height;

    // Apply per-page size scaling
    const scaledWidth = position.width * sizeRatio;
    const scaledHeight = position.height * sizeRatio;

    const logoStyle = {
        left: `${(position.x / canvasWidth) * 100}%`,
        top: `${(position.y / canvasHeight) * 100}%`,
        width: `${(scaledWidth / canvasWidth) * 100}%`,
        height: `${(scaledHeight / canvasHeight) * 100}%`,
    };

    // Watermark preview positions
    const wmEnabled = watermark?.enabled && !!watermark.text.trim();
    const wmFontSize = wmEnabled ? watermark!.fontSize * RENDER_SCALE : 0;
    const wmPositions = useMemo(() => {
        if (!wmEnabled) return [];
        return computeWatermarkPositions(watermark!, canvasWidth, canvasHeight);
    }, [wmEnabled, watermark, canvasWidth, canvasHeight]);

    return (
        <div
            onClick={onClick}
            className={`
        relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300
        ${statusInfo.borderClass}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}
        hover:scale-105 hover:shadow-xl
      `}
        >
            {/* Page thumbnail */}
            <div className="relative bg-white">
                <img
                    src={page.canvas.toDataURL()}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-auto"
                />

                {/* Logo overlay */}
                {!skipLogo && (
                    <div
                        className="absolute pointer-events-none"
                        style={logoStyle}
                    >
                        <img
                            src={logoPreviewUrl}
                            alt="Logo"
                            className="w-full h-full object-contain"
                            style={{ opacity: effectiveOpacity / 100 }}
                        />
                    </div>
                )}

                {/* Watermark preview overlay */}
                {wmEnabled && wmPositions.length > 0 && (
                    <svg
                        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        aria-hidden="true"
                    >
                        {wmPositions.map((pos, i) => (
                            <text
                                key={i}
                                x={pos.x}
                                y={pos.y}
                                fontSize={wmFontSize}
                                fill={watermark!.color}
                                opacity={watermark!.opacity / 100}
                                textAnchor="start"
                                transform={`rotate(${-watermark!.rotation}, ${pos.x}, ${pos.y})`}
                                style={{ fontFamily: cssFontFamily(watermark!.fontFamily) }}
                            >
                                {watermark!.text}
                            </text>
                        ))}
                    </svg>
                )}
            </div>

            {/* Status bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                            第 {page.pageNumber} 頁
                        </span>
                        {hasCustomSettings && (
                            <span className="text-[10px] bg-blue-500/50 text-blue-200 px-1.5 py-0.5 rounded">
                                自訂
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {statusInfo.icon}
                        <span className="text-xs text-gray-300">{statusInfo.label}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
