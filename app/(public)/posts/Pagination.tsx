'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    currentPage: number;
    totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function goToPage(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (page === 1) {
            params.delete('page');
        } else {
            params.set('page', String(page));
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    // Build page number list with ellipsis
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('ellipsis');
        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push('ellipsis');
        pages.push(totalPages);
    }

    const btnBase =
        'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors';
    const btnActive =
        'bg-blue-600 text-white';
    const btnDefault =
        'border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800';
    const btnDisabled =
        'border border-gray-200 text-gray-300 cursor-not-allowed dark:border-gray-800 dark:text-gray-700';

    return (
        <div className="mt-10 flex items-center justify-center gap-1">
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnDefault}`}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((p, i) =>
                p === 'ellipsis' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-400">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`${btnBase} ${p === currentPage ? btnActive : btnDefault}`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnDefault}`}
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
