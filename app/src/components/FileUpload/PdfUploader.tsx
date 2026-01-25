import { FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import { DropZone } from './DropZone';

interface PdfUploaderProps {
    file: File | null;
    pageCount: number | null;
    isValidating: boolean;
    error: string | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
    multiple?: boolean;
    onFilesSelect?: (files: File[]) => void;
}

export function PdfUploader({
    file,
    pageCount,
    isValidating,
    error,
    onFileSelect,
    onClear,
    multiple = false,
    onFilesSelect,
}: PdfUploaderProps) {
    if (file && !error) {
        return (
            <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>

                        <div>
                            <p className="font-semibold text-white truncate max-w-xs">
                                {file.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                {isValidating ? (
                                    <span className="flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        驗證中...
                                    </span>
                                ) : pageCount !== null ? (
                                    <span className="flex items-center gap-1 text-green-400">
                                        <CheckCircle className="w-3 h-3" />
                                        {pageCount} 頁
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClear}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="移除檔案"
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
                onFilesSelect={onFilesSelect}
                accept=".pdf"
                label={multiple ? "上傳多個 PDF 檔案" : "上傳 PDF 檔案"}
                description={multiple ? "可選擇多個 PDF 檔案進行批量處理" : "支援 PDF 格式，最大 20MB，最多 100 頁"}
                icon={<FileText className="w-8 h-8 text-blue-400" />}
                multiple={multiple}
            />

            {error && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
