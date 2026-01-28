import { Image } from 'lucide-react';
import { LogoSlot } from './LogoSlot';
import type { StoredLogo } from '../../types';
import { MAX_LOGO_SLOTS } from '../../types';

interface LogoPanelProps {
    logos: (StoredLogo | null)[];
    activeLogoId: string | null;
    onLogoUpload: (slotIndex: number, file: File) => void;
    onLogoDelete: (slotIndex: number) => void;
    onLogoSelect: (slotIndex: number) => void;
    uploadError: string | null;
    isLoading: boolean;
}

export function LogoPanel({
    logos,
    activeLogoId,
    onLogoUpload,
    onLogoDelete,
    onLogoSelect,
    uploadError,
    isLoading,
}: LogoPanelProps) {
    return (
        <div className="logo-panel glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Image className="w-4 h-4 text-purple-400" />
                Logo 面板
                <span className="text-[10px] text-gray-500 font-normal ml-auto">
                    {logos.filter(l => l !== null).length}/{MAX_LOGO_SLOTS}
                </span>
            </h3>

            {isLoading ? (
                <div className="grid grid-cols-4 lg:grid-cols-1 gap-3">
                    {Array.from({ length: MAX_LOGO_SLOTS }).map((_, i) => (
                        <div
                            key={i}
                            className="border-2 border-dashed border-white/10 rounded-xl p-3 animate-pulse"
                        >
                            <div className="w-5 h-5 bg-white/10 rounded mx-auto mb-1" />
                            <div className="w-10 h-2 bg-white/10 rounded mx-auto" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-4 lg:grid-cols-1 gap-3">
                    {Array.from({ length: MAX_LOGO_SLOTS }).map((_, i) => (
                        <LogoSlot
                            key={i}
                            slotIndex={i}
                            logo={logos[i] ?? null}
                            isActive={logos[i] !== null && logos[i]!.id === activeLogoId}
                            onUpload={(file) => onLogoUpload(i, file)}
                            onDelete={() => onLogoDelete(i)}
                            onSelect={() => onLogoSelect(i)}
                        />
                    ))}
                </div>
            )}

            {uploadError && (
                <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-xs text-red-400">{uploadError}</p>
                </div>
            )}

            <p className="text-[10px] text-gray-600 mt-3 text-center">
                點擊選擇使用的 Logo，拖曳或點擊空位上傳
            </p>
        </div>
    );
}
