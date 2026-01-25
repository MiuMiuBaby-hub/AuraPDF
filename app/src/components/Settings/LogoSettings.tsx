import { Settings } from 'lucide-react';

interface LogoSettingsProps {
    logoSize: number;
    onSizeChange: (size: number) => void;
    logoPreviewUrl: string | null;
}

export function LogoSettings({
    logoSize,
    onSizeChange,
    logoPreviewUrl,
}: LogoSettingsProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Logo 設定</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-gray-300">Logo 大小</label>
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
                </div>

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
                                    objectFit: 'contain'
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
