import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { ProcessedPage } from '../../types';

interface PageCardProps {
    page: ProcessedPage;
    logoPreviewUrl: string;
    logoOpacity: number;
    logoSize: number;
    onClick: () => void;
    isSelected?: boolean;
}

export function PageCard({
    page,
    logoPreviewUrl,
    logoOpacity,
    logoSize,
    onClick,
    isSelected = false,
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
