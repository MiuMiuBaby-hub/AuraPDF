import { Settings, RotateCcw } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../../utils/settingsStorage';
import { PositionSelector } from './PositionSelector';
import type { PositionName } from '../../types';

interface LogoSettingsProps {
    logoSize: number;
    logoOpacity: number;
    preferredPosition: PositionName;
    autoSize: boolean;
    autoSizePercent: number;
    onSizeChange: (size: number) => void;
    onOpacityChange: (opacity: number) => void;
    onPositionChange: (position: PositionName) => void;
    onAutoSizeChange: (enabled: boolean) => void;
    onAutoSizePercentChange: (percent: number) => void;
    logoPreviewUrl: string | null;
}

const isDefault = (
    size: number,
    opacity: number,
    position: PositionName,
    autoSize: boolean,
    autoSizePercent: number
) =>
    size === DEFAULT_SETTINGS.logoSize &&
    opacity === DEFAULT_SETTINGS.logoOpacity &&
    position === DEFAULT_SETTINGS.preferredPosition &&
    autoSize === DEFAULT_SETTINGS.autoSize &&
    autoSizePercent === DEFAULT_SETTINGS.autoSizePercent;

export function LogoSettings({
    logoSize,
    logoOpacity,
    preferredPosition,
    autoSize,
    autoSizePercent,
    onSizeChange,
    onOpacityChange,
    onPositionChange,
    onAutoSizeChange,
    onAutoSizePercentChange,
    logoPreviewUrl,
}: LogoSettingsProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Logo 設定</h3>
                    <span className="text-xs text-gray-500">自動儲存</span>
                </div>
                {!isDefault(logoSize, logoOpacity, preferredPosition, autoSize, autoSizePercent) && (
                    <button
                        onClick={() => {
                            onSizeChange(DEFAULT_SETTINGS.logoSize);
                            onOpacityChange(DEFAULT_SETTINGS.logoOpacity);
                            onPositionChange(DEFAULT_SETTINGS.preferredPosition);
                            onAutoSizeChange(DEFAULT_SETTINGS.autoSize);
                            onAutoSizePercentChange(DEFAULT_SETTINGS.autoSizePercent);
                        }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                        title="重置為預設值"
                    >
                        <RotateCcw className="w-3 h-3" />
                        重置
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-gray-300">Logo 大小</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs text-gray-400">自適應</span>
                            <div className="relative">
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
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-400">頁面比例</span>
                                <span className="text-sm font-mono text-blue-400">{autoSizePercent}%</span>
                            </div>
                            <input
                                type="range"
                                min="3"
                                max="15"
                                value={autoSizePercent}
                                onChange={(e) => onAutoSizePercentChange(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>3%</span>
                                <span>15%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                根據每頁尺寸自動計算 Logo 大小
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-end mb-1">
                                <span className="text-sm font-mono text-blue-400">{logoSize}px</span>
                            </div>
                            <input
                                type="range"
                                min="40"
                                max="150"
                                value={logoSize}
                                onChange={(e) => onSizeChange(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>40px</span>
                                <span>150px</span>
                            </div>
                        </>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-gray-300">Logo 透明度</label>
                        <span className="text-sm font-mono text-blue-400">{logoOpacity}%</span>
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

                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>淡（浮水印）</span>
                        <span>深</span>
                    </div>
                </div>

                <PositionSelector
                    value={preferredPosition}
                    onChange={onPositionChange}
                />

                {logoPreviewUrl && (
                    <div className="mt-4">
                        <label className="text-sm text-gray-300 mb-2 block">預覽大小</label>
                        <div className="bg-white/5 rounded-lg p-4 flex items-center justify-center">
                            <img
                                src={logoPreviewUrl}
                                alt="Logo size preview"
                                style={{
                                    width: `${logoSize}px`,
                                    height: 'auto',
                                    maxHeight: `${logoSize}px`,
                                    objectFit: 'contain',
                                    opacity: logoOpacity / 100
                                }}
                                className="transition-all duration-200"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
