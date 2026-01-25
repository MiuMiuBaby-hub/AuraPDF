import type { PricingConfig, CostEstimate } from '../types';

// Default pricing configuration (simulated for future paid version)
export const DEFAULT_PRICING: PricingConfig = {
    perPage: 0.005,      // $0.005 USD per page
    perFile: 0.01,       // $0.01 USD base fee per file
    currency: 'USD',
};

// USD to TWD exchange rate (approximate)
const USD_TO_TWD = 32;

// Calculate cost estimate for a PDF processing operation
export function calculateCostEstimate(
    pageCount: number,
    pricing: PricingConfig = DEFAULT_PRICING
): CostEstimate {
    const pageCost = pageCount * pricing.perPage;
    const fileCost = pricing.perFile;
    const totalCost = pageCost + fileCost;

    return {
        pageCount,
        pageCost,
        fileCost,
        totalCost,
    };
}

// Format cost for display
export function formatCost(
    amount: number,
    currency: 'USD' | 'TWD' = 'USD'
): string {
    if (currency === 'TWD') {
        const twdAmount = amount * USD_TO_TWD;
        return `NT$${twdAmount.toFixed(2)}`;
    }
    return `$${amount.toFixed(4)} USD`;
}

// Format cost in a compact way (for inline display)
export function formatCostCompact(
    amount: number,
    currency: 'USD' | 'TWD' = 'USD'
): string {
    if (currency === 'TWD') {
        const twdAmount = amount * USD_TO_TWD;
        return `NT$${twdAmount.toFixed(0)}`;
    }
    return `$${amount.toFixed(2)}`;
}
