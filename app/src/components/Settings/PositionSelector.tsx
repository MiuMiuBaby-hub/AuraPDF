import { useState } from 'react';
import type { PositionName } from '../../types';
import { POSITION_LABELS } from '../../utils/blankDetection';

interface PositionSelectorProps {
    value: PositionName;
    onChange: (position: PositionName) => void;
    autoFallback: boolean;
    onAutoFallbackChange: (enabled: boolean) => void;
    fallbackPriority: PositionName[];
    onFallbackPriorityChange: (priority: PositionName[]) => void;
}

// Grid layout: 3x3 representing page positions
const GRID_POSITIONS: PositionName[][] = [
    ['left-top', 'top-center', 'right-top'],
    ['left-center', 'center', 'right-center'],
    ['left-bottom', 'bottom-center', 'right-bottom'],
];

export function PositionSelector({
    value,
    onChange,
    autoFallback,
    onAutoFallbackChange,
    fallbackPriority,
    onFallbackPriorityChange,
}: PositionSelectorProps) {
    const [draggedPos, setDraggedPos] = useState<PositionName | null>(null);
    const [dragOverPos, setDragOverPos] = useState<PositionName | null>(null);

    // 取得位置的優先順序數字 (1-9)
    const getPriorityNumber = (pos: PositionName): number => {
        return fallbackPriority.indexOf(pos) + 1;
    };

    // 處理拖曳開始
    const handleDragStart = (e: React.DragEvent, pos: PositionName) => {
        if (!autoFallback) return;
        setDraggedPos(pos);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', pos);
    };

    // 處理拖曳經過
    const handleDragOver = (e: React.DragEvent, pos: PositionName) => {
        if (!autoFallback || !draggedPos) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverPos(pos);
    };

    // 處理放置
    const handleDrop = (e: React.DragEvent, targetPos: PositionName) => {
        e.preventDefault();
        if (!autoFallback || !draggedPos || draggedPos === targetPos) {
            setDraggedPos(null);
            setDragOverPos(null);
            return;
        }

        // 交換兩個位置的優先順序
        const newPriority = [...fallbackPriority];
        const draggedIndex = newPriority.indexOf(draggedPos);
        const targetIndex = newPriority.indexOf(targetPos);

        // 交換位置
        newPriority[draggedIndex] = targetPos;
        newPriority[targetIndex] = draggedPos;

        onFallbackPriorityChange(newPriority);
        setDraggedPos(null);
        setDragOverPos(null);
    };

    // 處理拖曳結束
    const handleDragEnd = () => {
        setDraggedPos(null);
        setDragOverPos(null);
    };

    return (
        <div className="space-y-1">
            <label className="text-xs text-gray-300">預設位置</label>
            <div className="bg-white/5 rounded-lg p-2">
                {/* Visual grid selector */}
                <div className="grid grid-cols-3 gap-1 aspect-[4/3] max-w-[120px] mx-auto">
                    {GRID_POSITIONS.flat().map((pos) => {
                        const isSelected = value === pos;
                        const priorityNum = getPriorityNumber(pos);
                        const isDragging = draggedPos === pos;
                        const isDragOver = dragOverPos === pos && draggedPos !== pos;

                        return (
                            <button
                                key={pos}
                                onClick={() => onChange(pos)}
                                draggable={autoFallback}
                                onDragStart={(e) => handleDragStart(e, pos)}
                                onDragOver={(e) => handleDragOver(e, pos)}
                                onDragLeave={() => setDragOverPos(null)}
                                onDrop={(e) => handleDrop(e, pos)}
                                onDragEnd={handleDragEnd}
                                className={`
                                    relative rounded transition-all duration-200 flex items-center justify-center
                                    ${isSelected
                                        ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }
                                    ${isDragging ? 'opacity-50 scale-95' : ''}
                                    ${isDragOver ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900' : ''}
                                    ${autoFallback ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                                `}
                                title={`${POSITION_LABELS[pos]}${autoFallback ? ` (優先順序: ${priorityNum})` : ''}`}
                            >
                                {autoFallback && (
                                    <span className={`
                                        text-[9px] font-bold
                                        ${isSelected ? 'text-white' : 'text-gray-400'}
                                    `}>
                                        {priorityNum}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                {/* Selected position label */}
                <div className="text-center mt-1 text-[10px] text-blue-400">
                    {POSITION_LABELS[value]}
                </div>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer mt-2">
                <input
                    type="checkbox"
                    checked={autoFallback}
                    onChange={(e) => onAutoFallbackChange(e.target.checked)}
                    className="rounded border-gray-500 bg-white/10 text-blue-500 w-3.5 h-3.5 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-[10px] text-gray-400">佔用時自動遞補</span>
            </label>
            {autoFallback && (
                <p className="text-[9px] text-gray-500 mt-1">
                    拖曳方塊可調整遞補順序
                </p>
            )}
        </div>
    );
}
