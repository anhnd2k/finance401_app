'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X } from 'lucide-react';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'popular', label: 'Most Popular' },
];

interface Props {
    categories: { id: number; name: string; slug: string }[];
    activeTag?: string;
    activeSearch?: string;
}

export default function PostsFilter({ categories, activeTag, activeSearch }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const sort = searchParams.get('sort') ?? 'newest';
    const category = searchParams.get('category') ?? '';

    function update(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    function removeFilter(key: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    }

    const selectClass =
        'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
                <select
                    value={sort}
                    onChange={(e) => update('sort', e.target.value)}
                    className={selectClass}
                    aria-label="Sort by"
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                <select
                    value={category}
                    onChange={(e) => update('category', e.target.value)}
                    className={selectClass}
                    aria-label="Filter by category"
                >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Active filter chips */}
            {(activeTag || activeSearch) && (
                <div className="flex flex-wrap gap-2">
                    {activeSearch && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            Search: &quot;{activeSearch}&quot;
                            <button
                                onClick={() => removeFilter('search')}
                                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                                aria-label="Remove search filter"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {activeTag && (
                        <span className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            Tag: {activeTag}
                            <button
                                onClick={() => removeFilter('tag')}
                                className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                                aria-label="Remove tag filter"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
