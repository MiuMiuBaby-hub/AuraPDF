import { BarChart3, FileText, Layers, DollarSign } from 'lucide-react';
import type { UsageStats } from '../../types';
import { formatCostCompact } from '../../config/pricing';

interface UsageStatsDisplayProps {
    stats: UsageStats;
}

export function UsageStatsDisplay({ stats }: UsageStatsDisplayProps) {
    // Don't show if no usage yet
    if (stats.sessionCount === 0) {
        return null;
    }

    const formatDate = (isoString: string): string => {
        if (!isoString) return '-';
        try {
            return new Date(isoString).toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
        } catch {
            return '-';
        }
    };

    return (
        <div className="glass-card p-6 mt-6">
            <div className="flex items-center justify-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                    累計使用統計
                </h3>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                    <Layers className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                        {stats.totalPagesProcessed.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">總頁數</div>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                    <FileText className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                        {stats.totalFilesProcessed.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">總檔案數</div>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                        {formatCostCompact(stats.totalCostAccumulated)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">累計費用</div>
                </div>
            </div>

            {/* Footer info */}
            <div className="mt-4 text-center text-xs text-gray-500">
                已使用 {stats.sessionCount} 次
                {stats.firstUsedAt && (
                    <span> · 首次使用: {formatDate(stats.firstUsedAt)}</span>
                )}
            </div>
        </div>
    );
}
