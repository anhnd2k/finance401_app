'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'popular', label: 'Most Popular' },
];

interface Props {
    categories: { id: number; name: string; slug: string }[];
}

export default function PostsFilter({ categories }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const sort = searchParams.get('sort') ?? 'newest';
    const category = searchParams.get('category') ?? '';

    function update(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    const selectClass =
        'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

    return (
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
    );
}
