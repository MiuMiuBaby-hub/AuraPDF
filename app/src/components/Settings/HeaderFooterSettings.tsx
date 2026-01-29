import { FileText, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_HEADER_FOOTER_SETTINGS } from '../../utils/settingsStorage';
import type { HeaderFooterSettings as HeaderFooterSettingsType, HeaderFooterRow, WatermarkFontFamily } from '../../types';

interface HeaderFooterSettingsProps {
    headerFooter: HeaderFooterSettingsType;
    onHeaderFooterChange: (settings: HeaderFooterSettingsType) => void;
}

// 字型選項
const FONT_OPTIONS: { value: WatermarkFontFamily; label: string }[] = [
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times-Roman', label: 'Times Roman' },
    { value: 'Courier', label: 'Courier' },
];

// 預設顏色
const PRESET_COLORS = ['#333333', '#666666', '#000000', '#0066CC'];

// 變數說明
const VARIABLES = [
    { key: '{page}', label: '頁碼' },
    { key: '{total}', label: '總頁數' },
    { key: '{date}', label: '日期' },
    { key: '{title}', label: '標題' },
];

// 快速範本
const QUICK_TEMPLATES = [
    { label: '頁碼', text: '{page} / {total}' },
    { label: '第N頁', text: '第 {page} 頁' },
    { label: '日期', text: '{date}' },
    { label: '標題', text: '{title}' },
];

export function HeaderFooterSettings({ headerFooter, onHeaderFooterChange }: HeaderFooterSettingsProps) {
    const [expandedSection, setExpandedSection] = useState<'header' | 'footer' | null>(
        headerFooter.header.enabled ? 'header' : headerFooter.footer.enabled ? 'footer' : null
    );

    // 更新頁首或頁尾
    const updateRow = (isHeader: boolean, updates: Partial<HeaderFooterRow>) => {
        const key = isHeader ? 'header' : 'footer';
        onHeaderFooterChange({
            ...headerFooter,
            [key]: { ...headerFooter[key], ...updates },
        });
    };

    // 更新區塊文字
    const updateBlock = (
        isHeader: boolean,
        position: 'left' | 'center' | 'right',
        updates: Partial<HeaderFooterRow['left']>
    ) => {
        const key = isHeader ? 'header' : 'footer';
        onHeaderFooterChange({
            ...headerFooter,
            [key]: {
                ...headerFooter[key],
                [position]: { ...headerFooter[key][position], ...updates },
            },
        });
    };

    const isDefault = () =>
        JSON.stringify(headerFooter) === JSON.stringify(DEFAULT_HEADER_FOOTER_SETTINGS);

    const handleReset = () => {
        onHeaderFooterChange({ ...DEFAULT_HEADER_FOOTER_SETTINGS });
    };

    const hasAnyEnabled = headerFooter.header.enabled || headerFooter.footer.enabled;

    // 渲染單一列設定（頁首或頁尾）
    const renderRowSettings = (row: HeaderFooterRow, isHeader: boolean) => {
        const sectionKey = isHeader ? 'header' : 'footer';
        const isExpanded = expandedSection === sectionKey;
        const accentColor = isHeader ? 'purple' : 'emerald';

        return (
            <div className="border border-white/10 rounded-lg overflow-hidden">
                {/* 區段標題 */}
                <button
                    onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium text-${accentColor}-400`}>
                            {isHeader ? '頁首' : '頁尾'}
                        </span>
                        {row.enabled && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-gray-400">
                                已啟用
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* 啟用開關 */}
                        <label
                            className="flex items-center gap-1.5 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="text-xs text-gray-400">啟用</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={row.enabled}
                                    onChange={(e) => {
                                        updateRow(isHeader, { enabled: e.target.checked });
                                        if (e.target.checked && !isExpanded) {
                                            setExpandedSection(sectionKey);
                                        }
                                    }}
                                    className="sr-only peer"
                                />
                                <div className={`w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-${accentColor}-500 transition-colors`} />
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                            </div>
                        </label>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </button>

                {/* 展開的設定內容 */}
                {isExpanded && row.enabled && (
                    <div className="p-4 space-y-4">
                        {/* 三欄文字輸入 */}
                        <div className="grid grid-cols-3 gap-3">
                            {(['left', 'center', 'right'] as const).map((pos) => (
                                <div key={pos}>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs text-gray-400">
                                            {pos === 'left' ? '左對齊' : pos === 'center' ? '置中' : '右對齊'}
                                        </label>
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={row[pos].enabled}
                                                onChange={(e) => updateBlock(isHeader, pos, { enabled: e.target.checked })}
                                                className="w-3 h-3 rounded border-gray-500 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                                            />
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={row[pos].text}
                                        onChange={(e) => updateBlock(isHeader, pos, { text: e.target.value })}
                                        placeholder={pos === 'center' ? '{page} / {total}' : ''}
                                        disabled={!row[pos].enabled}
                                        className={`w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 ${
                                            !row[pos].enabled ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        maxLength={50}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* 快速插入變數 */}
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">快速插入</label>
                            <div className="flex flex-wrap gap-1">
                                {QUICK_TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl.label}
                                        onClick={() => {
                                            // 插入到第一個啟用的區塊
                                            const positions: ('left' | 'center' | 'right')[] = ['center', 'left', 'right'];
                                            for (const pos of positions) {
                                                if (row[pos].enabled) {
                                                    updateBlock(isHeader, pos, { text: tpl.text });
                                                    break;
                                                }
                                            }
                                        }}
                                        className="px-2 py-0.5 text-xs rounded bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                                    >
                                        {tpl.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 樣式設定 - 單行 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {/* 字型 */}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">字型</label>
                                <select
                                    value={row.fontFamily}
                                    onChange={(e) => updateRow(isHeader, { fontFamily: e.target.value as WatermarkFontFamily })}
                                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-400"
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
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs text-gray-400">大小</label>
                                    <span className="text-xs font-mono text-purple-400">{row.fontSize}pt</span>
                                </div>
                                <input
                                    type="range"
                                    min="8"
                                    max="24"
                                    step="1"
                                    value={row.fontSize}
                                    onChange={(e) => updateRow(isHeader, { fontSize: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                            </div>

                            {/* 顏色 */}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">顏色</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="color"
                                        value={row.color}
                                        onChange={(e) => updateRow(isHeader, { color: e.target.value })}
                                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                    />
                                    {PRESET_COLORS.slice(0, 3).map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => updateRow(isHeader, { color })}
                                            className={`w-5 h-5 rounded-full border transition-all ${
                                                row.color === color
                                                    ? 'border-purple-400 scale-110'
                                                    : 'border-transparent hover:border-white/50'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* 邊距 */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs text-gray-400">邊距</label>
                                    <span className="text-xs font-mono text-purple-400">{row.margin}pt</span>
                                </div>
                                <input
                                    type="range"
                                    min="20"
                                    max="80"
                                    step="5"
                                    value={row.margin}
                                    onChange={(e) => updateRow(isHeader, { margin: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="glass-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-white">頁首/頁尾</h3>
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
                </div>
            </div>

            {/* 頁首和頁尾設定區段 */}
            <div className="space-y-3">
                {renderRowSettings(headerFooter.header, true)}
                {renderRowSettings(headerFooter.footer, false)}
            </div>

            {/* 變數說明 */}
            {hasAnyEnabled && (
                <div className="mt-3 p-2 bg-white/5 rounded text-[10px] text-gray-500">
                    <span className="text-gray-400">可用變數：</span>
                    {VARIABLES.map((v, i) => (
                        <span key={v.key}>
                            {i > 0 && ' · '}
                            <code className="text-purple-400">{v.key}</code>
                            <span className="text-gray-500">={v.label}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
