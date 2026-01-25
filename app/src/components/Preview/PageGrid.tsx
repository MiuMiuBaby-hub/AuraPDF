import type { ProcessedPage } from '../../types';
import { PageCard } from './PageCard';

interface PageGridProps {
    pages: ProcessedPage[];
    logoPreviewUrl: string;
    selectedPage: number | null;
    onPageSelect: (pageNumber: number) => void;
}

export function PageGrid({
    pages,
    logoPreviewUrl,
    selectedPage,
    onPageSelect,
}: PageGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {pages.map((page) => (
                <PageCard
                    key={page.pageNumber}
                    page={page}
                    logoPreviewUrl={logoPreviewUrl}
                    onClick={() => onPageSelect(page.pageNumber)}
                    isSelected={selectedPage === page.pageNumber}
                />
            ))}
        </div>
    );
}
