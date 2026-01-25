import type { PositionName } from '../../types';
import { POSITION_LABELS } from '../../utils/blankDetection';

interface PositionSelectorProps {
    value: PositionName;
    onChange: (position: PositionName) => void;
}

// Grid layout: 3x3 representing page positions
const GRID_POSITIONS: (PositionName | null)[][] = [
    ['left-top', 'top-center', 'right-top'],
    ['left-center', 'center', 'right-center'],
    ['left-bottom', 'bottom-center', 'right-bottom'],
];

export function PositionSelector({ value, onChange }: PositionSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm text-gray-300">Logo 預設位置</label>
            <div className="bg-white/5 rounded-lg p-3">
                {/* Visual grid selector */}
                <div className="grid grid-cols-3 gap-1 aspect-[4/3] max-w-[180px] mx-auto">
                    {GRID_POSITIONS.flat().map((pos) => {
                        if (!pos) return <div key="empty" />;
                        const isSelected = value === pos;
                        return (
                            <button
                                key={pos}
                                onClick={() => onChange(pos)}
                                className={`
                                    rounded transition-all duration-200
                                    ${isSelected
                                        ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }
                                `}
                                title={POSITION_LABELS[pos]}
                            />
                        );
                    })}
                </div>
                {/* Selected position label */}
                <div className="text-center mt-2 text-sm text-blue-400">
                    {POSITION_LABELS[value]}
                </div>
            </div>
        </div>
    );
}
