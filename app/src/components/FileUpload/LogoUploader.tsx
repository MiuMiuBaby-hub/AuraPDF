import { Image, X } from 'lucide-react';
import { DropZone } from './DropZone';

interface LogoUploaderProps {
    file: File | null;
    previewUrl: string | null;
    error: string | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
}

export function LogoUploader({
    file,
    previewUrl,
    error,
    onFileSelect,
    onClear,
}: LogoUploaderProps) {
    if (file && previewUrl && !error) {
        return (
            <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                            <img
                                src={previewUrl}
                                alt="Logo preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        <div>
                            <p className="font-semibold text-white truncate max-w-xs">
                                {file.name}
                            </p>
                            <p className="text-sm text-gray-400">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClear}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="移除圖片"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <DropZone
                onFileSelect={onFileSelect}
                accept=".png,.jpg,.jpeg,.svg"
                label="上傳 Logo 圖片"
                description="支援 PNG、JPG、SVG 格式，建議使用 PNG 透明背景"
                icon={<Image className="w-8 h-8 text-purple-400" />}
            />

            {error && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
