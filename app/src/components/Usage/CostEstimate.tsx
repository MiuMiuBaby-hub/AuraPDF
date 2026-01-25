import { DollarSign, FileText, Layers } from 'lucide-react';
import type { CostEstimate } from '../../types';
import { formatCost, DEFAULT_PRICING } from '../../config/pricing';

interface CostEstimateDisplayProps {
    estimate: CostEstimate;
}

export function CostEstimateDisplay({ estimate }: CostEstimateDisplayProps) {
    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <h4 className="text-sm font-medium text-white">
                    預估費用
                </h4>
                <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded">
                    未來付費版
                </span>
            </div>

            {/* Total cost */}
            <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-400">
                    {formatCost(estimate.totalCost)}
                </div>
            </div>

            {/* Cost breakdown */}
            <div className="flex justify-center gap-6 text-sm text-gray-400 border-t border-white/10 pt-3">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>
                        {estimate.pageCount} 頁 x ${DEFAULT_PRICING.perPage}
                    </span>
                    <span className="text-gray-500">=</span>
                    <span className="text-white">${estimate.pageCost.toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>檔案費</span>
                    <span className="text-white">${estimate.fileCost.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
