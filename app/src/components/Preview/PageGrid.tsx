import type { ProcessedPage, WatermarkSettings } from '../../types';
import { PageCard } from './PageCard';

interface PageGridProps {
    pages: ProcessedPage[];
    logoPreviewUrl: string;
    logoOpacity: number;
    logoSize: number;
    selectedPage: number | null;
    onPageSelect: (pageNumber: number) => void;
    watermark?: WatermarkSettings;
}

export function PageGrid({
    pages,
    logoPreviewUrl,
    logoOpacity,
    logoSize,
    selectedPage,
    onPageSelect,
    watermark,
}: PageGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {pages.map((page) => (
                <PageCard
                    key={page.pageNumber}
                    page={page}
                    logoPreviewUrl={logoPreviewUrl}
                    logoOpacity={logoOpacity}
                    logoSize={logoSize}
                    onClick={() => onPageSelect(page.pageNumber)}
                    isSelected={selectedPage === page.pageNumber}
                    watermark={watermark}
                />
            ))}
        </div>
    );
}
