import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Move, SkipForward, RotateCcw, Copy, Settings } from 'lucide-react';
import type { ProcessedPage, LogoPosition } from '../../types';
import { constrainPosition } from '../../utils/blankDetection';

interface PageEditorProps {
    page: ProcessedPage;
    logoPreviewUrl: string;
    logoOpacity: number;
    logoSize: number;
    onPositionChange: (position: LogoPosition) => void;
    onPageSettingsChange: (settings: { logoSize?: number; logoOpacity?: number }) => void;
    onSkipPage: () => void;
    onResetPosition: () => void;
    onApplyToAll: () => void;
    onClose: () => void;
}

export function PageEditor({
    page,
    logoPreviewUrl,
    logoOpacity,
    logoSize,
    onPositionChange,
    onPageSettingsChange,
    onSkipPage,
    onResetPosition,
    onApplyToAll,
    onClose,
}: PageEditorProps) {
    // 使用每頁設定或全局設定
    const effectiveOpacity = page.logoOpacity ?? logoOpacity;
    const effectiveSize = page.logoSize ?? logoSize;
    const hasCustomSettings = page.logoSize !== undefined || page.logoOpacity !== undefined;

    // Calculate size scale ratio for per-page logo size
    const sizeRatio = effectiveSize / logoSize;

    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const position = page.manualPosition || page.detection.position;
    const canvasWidth = page.canvas.width;
    const canvasHeight = page.canvas.height;

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);

        const logoElement = e.currentTarget as HTMLElement;
        const rect = logoElement.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const scaleX = canvasWidth / containerRect.width;
        const scaleY = canvasHeight / containerRect.height;

        const newX = (e.clientX - containerRect.left - dragOffset.x) * scaleX;
        const newY = (e.clientY - containerRect.top - dragOffset.y) * scaleY;

        const newPosition = constrainPosition(
            {
                x: newX,
                y: newY,
                width: position.width,
                height: position.height,
            },
            canvasWidth,
            canvasHeight
        );

        onPositionChange(newPosition);
    }, [isDragging, dragOffset, canvasWidth, canvasHeight, position, onPositionChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">
                        編輯第 {page.pageNumber} 頁
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Editor area */}
                <div className="flex-1 overflow-auto p-4">
                    <div
                        ref={containerRef}
                        className="relative bg-white rounded-lg shadow-xl mx-auto"
                        style={{ maxWidth: '100%', aspectRatio: `${canvasWidth}/${canvasHeight}` }}
                    >
                        <img
                            src={page.canvas.toDataURL()}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-full"
                            draggable={false}
                        />

                        {/* Draggable Logo */}
                        {!page.skipLogo && (
                            <div
                                className={`absolute cursor-move select-none transition-shadow ${isDragging ? 'shadow-2xl ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-400'
                                    }`}
                                style={logoStyle}
                                onMouseDown={handleMouseDown}
                            >
                                <img
                                    src={logoPreviewUrl}
                                    alt="Logo"
                                    className="w-full h-full object-contain pointer-events-none"
                                    style={{ opacity: effectiveOpacity / 100 }}
                                    draggable={false}
                                />

                                {/* Drag indicator */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                                    <Move className="w-3 h-3" />
                                    拖拽移動
                                </div>
                            </div>
                        )}
                    </div>

                    {page.skipLogo && (
                        <div className="mt-4 text-center text-gray-400">
                            此頁已設定為跳過 Logo
                        </div>
                    )}
                </div>

                {/* Per-page settings panel */}
                {!page.skipLogo && (
                    <div className="mx-4 mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings className="w-4 h-4 text-blue-400" />
                            <h4 className="text-sm font-semibold text-white">此頁 Logo 設定</h4>
                            {hasCustomSettings && (
                                <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded">
                                    自訂
                                </span>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Logo Size Slider */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-gray-400">Logo 大小</label>
                                    <span className="text-xs font-mono text-blue-400">
                                        {effectiveSize}px
                                        {page.logoSize === undefined && (
                                            <span className="text-gray-500 ml-1">(全局)</span>
                                        )}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="40"
                                    max="150"
                                    value={effectiveSize}
                                    onChange={(e) => onPageSettingsChange({
                                        logoSize: parseInt(e.target.value),
                                        logoOpacity: page.logoOpacity
                                    })}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-600 mt-1">
                                    <span>40px</span>
                                    <span>150px</span>
                                </div>
                            </div>

                            {/* Logo Opacity Slider */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-gray-400">Logo 透明度</label>
                                    <span className="text-xs font-mono text-blue-400">
                                        {effectiveOpacity}%
                                        {page.logoOpacity === undefined && (
                                            <span className="text-gray-500 ml-1">(全局)</span>
                                        )}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="5"
                                    value={effectiveOpacity}
                                    onChange={(e) => onPageSettingsChange({
                                        logoSize: page.logoSize,
                                        logoOpacity: parseInt(e.target.value)
                                    })}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-600 mt-1">
                                    <span>淡</span>
                                    <span>深</span>
                                </div>
                            </div>
                        </div>

                        {/* Reset to global settings button */}
                        {hasCustomSettings && (
                            <button
                                onClick={() => onPageSettingsChange({ logoSize: undefined, logoOpacity: undefined })}
                                className="mt-3 text-xs px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors w-full"
                            >
                                重置為全局設定
                            </button>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-white/10">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={onSkipPage}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors text-sm"
                        >
                            <SkipForward className="w-4 h-4" />
                            {page.skipLogo ? '取消跳過' : '跳過此頁'}
                        </button>

                        <button
                            onClick={onResetPosition}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors text-sm"
                        >
                            <RotateCcw className="w-4 h-4" />
                            重置位置
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onApplyToAll}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors text-sm"
                        >
                            <Copy className="w-4 h-4" />
                            應用到所有頁面
                        </button>

                        <button
                            onClick={onClose}
                            className="btn-primary text-sm"
                        >
                            完成
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
