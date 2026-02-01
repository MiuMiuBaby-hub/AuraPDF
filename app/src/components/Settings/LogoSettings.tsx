import { Settings, RotateCcw } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../../utils/settingsStorage';
import { PositionSelector } from './PositionSelector';
import type { PositionName } from '../../types';

interface LogoSettingsProps {
    logoEnabled: boolean;
    logoSize: number;
    logoOpacity: number;
    preferredPosition: PositionName;
    autoSize: boolean;
    autoSizePercent: number;
    onEnabledChange: (enabled: boolean) => void;
    onSizeChange: (size: number) => void;
    onOpacityChange: (opacity: number) => void;
    onPositionChange: (position: PositionName) => void;
    onAutoSizeChange: (enabled: boolean) => void;
    onAutoSizePercentChange: (percent: number) => void;
    autoFallback: boolean;
    onAutoFallbackChange: (enabled: boolean) => void;
    fallbackPriority: PositionName[];
    onFallbackPriorityChange: (priority: PositionName[]) => void;
    logoPreviewUrl: string | null;
}

const isDefault = (
    size: number,
    opacity: number,
    position: PositionName,
    autoSize: boolean,
    autoSizePercent: number,
    autoFallback: boolean,
    fallbackPriority: PositionName[]
) =>
    size === DEFAULT_SETTINGS.logoSize &&
    opacity === DEFAULT_SETTINGS.logoOpacity &&
    position === DEFAULT_SETTINGS.preferredPosition &&
    autoSize === DEFAULT_SETTINGS.autoSize &&
    autoSizePercent === DEFAULT_SETTINGS.autoSizePercent &&
    autoFallback === DEFAULT_SETTINGS.autoFallback &&
    JSON.stringify(fallbackPriority) === JSON.stringify(DEFAULT_SETTINGS.fallbackPriority);

export function LogoSettings({
    logoEnabled,
    logoSize,
    logoOpacity,
    preferredPosition,
    autoSize,
    autoSizePercent,
    onEnabledChange,
    onSizeChange,
    onOpacityChange,
    onPositionChange,
    onAutoSizeChange,
    onAutoSizePercentChange,
    autoFallback,
    onAutoFallbackChange,
    fallbackPriority,
    onFallbackPriorityChange,
    logoPreviewUrl,
}: LogoSettingsProps) {
    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">Logo 設定</h3>
                    <span className="text-xs text-gray-500">自動儲存</span>
                </div>
                <div className="flex items-center gap-3">
                    {!isDefault(logoSize, logoOpacity, preferredPosition, autoSize, autoSizePercent, autoFallback, fallbackPriority) && (
                        <button
                            onClick={() => {
                                onSizeChange(DEFAULT_SETTINGS.logoSize);
                                onOpacityChange(DEFAULT_SETTINGS.logoOpacity);
                                onPositionChange(DEFAULT_SETTINGS.preferredPosition);
                                onAutoSizeChange(DEFAULT_SETTINGS.autoSize);
                                onAutoSizePercentChange(DEFAULT_SETTINGS.autoSizePercent);
                                onAutoFallbackChange(DEFAULT_SETTINGS.autoFallback);
                                onFallbackPriorityChange(DEFAULT_SETTINGS.fallbackPriority);
                            }}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                            title="重置為預設值"
                        >
                            <RotateCcw className="w-3 h-3" />
                            重置
                        </button>
                    )}
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <span className="text-xs text-gray-400">啟用</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={logoEnabled}
                                onChange={(e) => onEnabledChange(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-colors" />
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                        </div>
                    </label>
                </div>
            </div>

            {logoEnabled && <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Column 1: Logo 大小 */}
                <div className="space-y-1 sm:pr-6 sm:border-r sm:border-white/10">
                    <div className="flex justify-between items-center">
                        <label className="text-xs text-gray-300">大小</label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <span className="text-[10px] text-gray-400">自適應</span>
                            <div className="relative" title="根據每頁尺寸自動計算 Logo 大小">
                                <input
                                    type="checkbox"
                                    checked={autoSize}
                                    onChange={(e) => onAutoSizeChange(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-colors" />
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                            </div>
                        </label>
                    </div>

                    {autoSize ? (
                        <>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-400">頁面比例</span>
                                <span className="text-xs font-mono text-blue-400">{autoSizePercent}%</span>
                            </div>
                            <input
                                type="range"
                                min="3"
                                max="15"
                                value={autoSizePercent}
                                onChange={(e) => onAutoSizePercentChange(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>3%</span>
                                <span>15%</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-end">
                                <span className="text-xs font-mono text-blue-400">{logoSize}px</span>
                            </div>
                            <input
                                type="range"
                                min="40"
                                max="150"
                                value={logoSize}
                                onChange={(e) => onSizeChange(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>40px</span>
                                <span>150px</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Column 2: Logo 透明度 */}
                <div className="space-y-1 sm:pr-6 sm:border-r sm:border-white/10">
                    <div className="flex justify-between items-center">
                        <label className="text-xs text-gray-300">透明度</label>
                        <span className="text-xs font-mono text-blue-400">{logoOpacity}%</span>
                    </div>

                    <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={logoOpacity}
                        onChange={(e) => onOpacityChange(parseInt(e.target.value))}
                        className="w-full"
                    />

                    <div className="flex justify-between text-[10px] text-gray-500">
                        <span>淡</span>
                        <span>深</span>
                    </div>

                    {logoPreviewUrl && (
                        <div className="bg-white/5 rounded p-2 flex items-center justify-center mt-1">
                            <img
                                src={logoPreviewUrl}
                                alt="Logo preview"
                                style={{
                                    width: `${Math.min(logoSize, 48)}px`,
                                    height: 'auto',
                                    maxHeight: '48px',
                                    objectFit: 'contain',
                                    opacity: logoOpacity / 100
                                }}
                                className="transition-all duration-200"
                            />
                        </div>
                    )}
                </div>

                {/* Column 3: Logo 預設位置 */}
                <PositionSelector
                    value={preferredPosition}
                    onChange={onPositionChange}
                    autoFallback={autoFallback}
                    onAutoFallbackChange={onAutoFallbackChange}
                    fallbackPriority={fallbackPriority}
                    onFallbackPriorityChange={onFallbackPriorityChange}
                />
            </div>}
        </div>
    );
}
