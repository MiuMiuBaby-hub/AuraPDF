import { Droplets, RotateCcw, RotateCw } from 'lucide-react';
import { DEFAULT_WATERMARK_SETTINGS } from '../../utils/settingsStorage';
import type { WatermarkSettings as WatermarkSettingsType, WatermarkFontFamily, WatermarkPosition } from '../../types';

interface WatermarkSettingsProps {
    watermark: WatermarkSettingsType;
    onWatermarkChange: (watermark: WatermarkSettingsType) => void;
}

// 預設文字選項
const PRESET_TEXTS = ['機密', '草稿', 'CONFIDENTIAL', 'DRAFT', '僅供內部使用'];

// 字型選項
const FONT_OPTIONS: { value: WatermarkFontFamily; label: string }[] = [
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times-Roman', label: 'Times Roman' },
    { value: 'Courier', label: 'Courier' },
];

// 位置選項
const POSITION_OPTIONS: { value: WatermarkPosition; label: string }[] = [
    { value: 'center', label: '中央' },
    { value: 'top-left', label: '左上' },
    { value: 'top-right', label: '右上' },
    { value: 'bottom-left', label: '左下' },
    { value: 'bottom-right', label: '右下' },
    { value: 'tile', label: '平鋪' },
];

// 預設顏色
const PRESET_COLORS = ['#888888', '#FF0000', '#0066CC', '#000000'];

export function WatermarkSettings({ watermark, onWatermarkChange }: WatermarkSettingsProps) {
    // 輔助更新函數
    const update = (updates: Partial<WatermarkSettingsType>) => {
        onWatermarkChange({ ...watermark, ...updates });
    };

    const updateTile = (updates: Partial<WatermarkSettingsType['tileSettings']>) => {
        onWatermarkChange({
            ...watermark,
            tileSettings: { ...watermark.tileSettings, ...updates },
        });
    };

    const isDefault = () =>
        JSON.stringify(watermark) === JSON.stringify(DEFAULT_WATERMARK_SETTINGS);

    const handleReset = () => {
        onWatermarkChange({ ...DEFAULT_WATERMARK_SETTINGS });
    };

    return (
        <div className="glass-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">浮水印</h3>
                    <span className="text-xs text-gray-500">自動儲存</span>
                </div>
                <div className="flex items-center gap-3">
                    {!isDefault() && (
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                            title="重置為預設值"
                        >
                            <RotateCcw className="w-3 h-3" />
                            重置
                        </button>
                    )}
                    {/* 啟用開關 */}
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <span className="text-xs text-gray-400">啟用</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={watermark.enabled}
                                onChange={(e) => update({ enabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-cyan-500 transition-colors" />
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                        </div>
                    </label>
                </div>
            </div>

            {/* 展開的設定內容 */}
            {watermark.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Column 1: 文字與字型 */}
                    <div className="space-y-3 sm:pr-6 sm:border-r sm:border-white/10">
                        {/* 文字輸入 */}
                        <div>
                            <label className="text-xs text-gray-300 block mb-1">文字內容</label>
                            <input
                                type="text"
                                value={watermark.text}
                                onChange={(e) => update({ text: e.target.value })}
                                placeholder="輸入浮水印文字"
                                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                                maxLength={50}
                            />
                        </div>

                        {/* 預設文字快捷按鈕 */}
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">快速選擇</label>
                            <div className="flex flex-wrap gap-1">
                                {PRESET_TEXTS.map((text) => (
                                    <button
                                        key={text}
                                        onClick={() => update({ text })}
                                        className={`px-2 py-0.5 text-xs rounded transition-colors ${
                                            watermark.text === text
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    >
                                        {text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 字型選擇 */}
                        <div>
                            <label className="text-xs text-gray-300 block mb-1">字型</label>
                            <select
                                value={watermark.fontFamily}
                                onChange={(e) => update({ fontFamily: e.target.value as WatermarkFontFamily })}
                                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                            >
                                {FONT_OPTIONS.map((f) => (
                                    <option key={f.value} value={f.value} className="bg-gray-800">
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 字體大小 */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-300">字體大小</label>
                                <span className="text-xs font-mono text-cyan-400">{watermark.fontSize}pt</span>
                            </div>
                            <input
                                type="range"
                                min="12"
                                max="72"
                                step="2"
                                value={watermark.fontSize}
                                onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>12pt</span>
                                <span>72pt</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: 顏色與透明度 */}
                    <div className="space-y-3 sm:pr-6 sm:border-r sm:border-white/10">
                        {/* 顏色選擇 */}
                        <div>
                            <label className="text-xs text-gray-300 block mb-1">顏色</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={watermark.color}
                                    onChange={(e) => update({ color: e.target.value })}
                                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                                />
                                <span className="text-xs font-mono text-gray-400">{watermark.color}</span>
                            </div>
                        </div>

                        {/* 預設顏色快捷 */}
                        <div className="flex gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => update({ color })}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                                        watermark.color === color
                                            ? 'border-cyan-400 scale-110'
                                            : 'border-transparent hover:border-white/50'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>

                        {/* 透明度 */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-300">透明度</label>
                                <span className="text-xs font-mono text-cyan-400">{watermark.opacity}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                step="5"
                                value={watermark.opacity}
                                onChange={(e) => update({ opacity: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>淡</span>
                                <span>深</span>
                            </div>
                        </div>

                        {/* 預覽區域 */}
                        <div className="bg-white rounded p-3 flex items-center justify-center min-h-[60px] overflow-hidden">
                            <span
                                style={{
                                    fontFamily: watermark.fontFamily === 'Times-Roman' ? 'Times New Roman, serif' :
                                               watermark.fontFamily === 'Courier' ? 'Courier New, monospace' :
                                               'Helvetica, Arial, sans-serif',
                                    fontSize: `${Math.min(watermark.fontSize, 24)}px`,
                                    color: watermark.color,
                                    opacity: watermark.opacity / 100,
                                    transform: `rotate(${watermark.rotation}deg)`,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {watermark.text || '預覽文字'}
                            </span>
                        </div>
                    </div>

                    {/* Column 3: 位置與旋轉 */}
                    <div className="space-y-3">
                        {/* 旋轉角度 */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-300 flex items-center gap-1">
                                    <RotateCw className="w-3 h-3" />
                                    旋轉角度
                                </label>
                                <span className="text-xs font-mono text-cyan-400">{watermark.rotation}°</span>
                            </div>
                            <input
                                type="range"
                                min="-90"
                                max="90"
                                step="5"
                                value={watermark.rotation}
                                onChange={(e) => update({ rotation: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>-90°</span>
                                <span>0°</span>
                                <span>90°</span>
                            </div>
                        </div>

                        {/* 位置選擇 */}
                        <div>
                            <label className="text-xs text-gray-300 block mb-1">位置</label>
                            <select
                                value={watermark.position}
                                onChange={(e) => update({ position: e.target.value as WatermarkPosition })}
                                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                            >
                                {POSITION_OPTIONS.map((p) => (
                                    <option key={p.value} value={p.value} className="bg-gray-800">
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 平鋪設定（條件顯示） */}
                        {watermark.position === 'tile' && (
                            <div className="space-y-2 p-2 bg-white/5 rounded">
                                <label className="text-xs text-gray-400 block">平鋪設定</label>

                                {/* 水平間距 */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400">水平間距</span>
                                        <span className="text-[10px] font-mono text-cyan-400">
                                            {watermark.tileSettings.horizontalSpacing}pt
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="80"
                                        max="300"
                                        step="10"
                                        value={watermark.tileSettings.horizontalSpacing}
                                        onChange={(e) => updateTile({ horizontalSpacing: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>

                                {/* 垂直間距 */}
                                <div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400">垂直間距</span>
                                        <span className="text-[10px] font-mono text-cyan-400">
                                            {watermark.tileSettings.verticalSpacing}pt
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="60"
                                        max="200"
                                        step="10"
                                        value={watermark.tileSettings.verticalSpacing}
                                        onChange={(e) => updateTile({ verticalSpacing: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>

                                {/* 錯位排列 */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={watermark.tileSettings.offsetAlternateRows}
                                        onChange={(e) => updateTile({ offsetAlternateRows: e.target.checked })}
                                        className="w-3 h-3 rounded border-gray-500 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                                    />
                                    <span className="text-[10px] text-gray-400">錯位排列（棋盤式）</span>
                                </label>
                            </div>
                        )}

                        {/* 提示 */}
                        <p className="text-[10px] text-gray-500">
                            {watermark.position === 'tile'
                                ? '浮水印將平鋪覆蓋整個頁面'
                                : '浮水印將置於頁面指定位置'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
