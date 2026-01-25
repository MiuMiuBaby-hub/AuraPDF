import { FileText, CheckCircle, Loader2, AlertCircle, X, Clock } from 'lucide-react';
import type { BatchFile } from '../../types';
import { formatFileSize } from '../../utils/zipUtils';

interface BatchFileListProps {
    files: BatchFile[];
    onRemoveFile: (id: string) => void;
    disabled?: boolean;
}

const statusConfig: Record<BatchFile['status'], { icon: React.ReactNode; label: string; color: string }> = {
    pending: {
        icon: <Clock className="w-4 h-4" />,
        label: '等待中',
        color: 'text-gray-400',
    },
    validating: {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        label: '驗證中',
        color: 'text-blue-400',
    },
    analyzing: {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        label: '分析中',
        color: 'text-blue-400',
    },
    ready: {
        icon: <CheckCircle className="w-4 h-4" />,
        label: '就緒',
        color: 'text-green-400',
    },
    processing: {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        label: '處理中',
        color: 'text-purple-400',
    },
    completed: {
        icon: <CheckCircle className="w-4 h-4" />,
        label: '完成',
        color: 'text-green-500',
    },
    error: {
        icon: <AlertCircle className="w-4 h-4" />,
        label: '錯誤',
        color: 'text-red-400',
    },
};

export function BatchFileList({ files, onRemoveFile, disabled }: BatchFileListProps) {
    if (files.length === 0) {
        return null;
    }

    const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 0), 0);
    const completedCount = files.filter(f => f.status === 'completed').length;
    const errorCount = files.filter(f => f.status === 'error').length;

    return (
        <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">
                    檔案列表 ({files.length} 個檔案)
                </h3>
                <div className="text-sm text-gray-400">
                    共 {totalPages} 頁
                    {completedCount > 0 && (
                        <span className="text-green-400 ml-2">
                            {completedCount} 完成
                        </span>
                    )}
                    {errorCount > 0 && (
                        <span className="text-red-400 ml-2">
                            {errorCount} 失敗
                        </span>
                    )}
                </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
                {files.map((file) => {
                    const status = statusConfig[file.status];
                    return (
                        <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                        >
                            <FileText className="w-5 h-5 text-gray-400 shrink-0" />

                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">
                                    {file.file.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-500">
                                        {formatFileSize(file.file.size)}
                                    </span>
                                    {file.pageCount && (
                                        <span className="text-gray-500">
                                            {file.pageCount} 頁
                                        </span>
                                    )}
                                    {file.error && (
                                        <span className="text-red-400 truncate">
                                            {file.error}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                                {status.icon}
                                <span>{status.label}</span>
                            </div>

                            {!disabled && file.status !== 'processing' && (
                                <button
                                    onClick={() => onRemoveFile(file.id)}
                                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                                    title="移除檔案"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
