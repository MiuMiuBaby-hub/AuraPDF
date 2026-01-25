import { Loader2 } from 'lucide-react';
import type { BatchProgress as BatchProgressType } from '../../types';

interface BatchProgressProps {
    progress: BatchProgressType;
    totalFiles: number;
}

const phaseLabels: Record<BatchProgressType['phase'], string> = {
    validating: '驗證檔案',
    analyzing: '分析頁面',
    processing: '嵌入 Logo',
    zipping: '打包 ZIP',
};

export function BatchProgressDisplay({ progress, totalFiles }: BatchProgressProps) {
    const { currentFileIndex, currentFileName, phase, overallProgress } = progress;

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <div>
                    <h3 className="text-white font-medium">
                        批量處理中...
                    </h3>
                    <p className="text-sm text-gray-400">
                        {phaseLabels[phase]} - {currentFileName}
                    </p>
                </div>
            </div>

            {/* Overall progress bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                        檔案 {currentFileIndex + 1} / {totalFiles}
                    </span>
                    <span className="text-white">
                        {overallProgress}%
                    </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
                請勿關閉此頁面，處理完成後將自動下載
            </p>
        </div>
    );
}
