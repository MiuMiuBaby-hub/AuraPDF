import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Move, SkipForward, RotateCcw, Copy } from 'lucide-react';
import type { ProcessedPage, LogoPosition } from '../../types';
import { constrainPosition } from '../../utils/blankDetection';

interface PageEditorProps {
    page: ProcessedPage;
    logoPreviewUrl: string;
    onPositionChange: (position: LogoPosition) => void;
    onSkipPage: () => void;
    onResetPosition: () => void;
    onApplyToAll: () => void;
    onClose: () => void;
}

export function PageEditor({
    page,
    logoPreviewUrl,
    onPositionChange,
    onSkipPage,
    onResetPosition,
    onApplyToAll,
    onClose,
}: PageEditorProps) {
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

    const logoStyle = {
        left: `${(position.x / canvasWidth) * 100}%`,
        top: `${(position.y / canvasHeight) * 100}%`,
        width: `${(position.width / canvasWidth) * 100}%`,
        height: `${(position.height / canvasHeight) * 100}%`,
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
