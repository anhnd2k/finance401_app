'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { LOCALE_SHORT } from '@/lib/locale';

export interface PostVersion {
    id: number;
    title: string;
    slug: string;
    language: string;
    status: string;
    views: number;
    createdAt: string;
    category: { name: string } | null;
    author: { username: string } | null;
}

export interface PostGroup {
    gid: number;
    versions: PostVersion[];
}

function PostGroupRow({ group }: { group: PostGroup }) {
    const defaultLang =
        group.versions.find((v) => v.language === 'vi')?.language ??
        group.versions[0].language;
    const [selectedLang, setSelectedLang] = useState(defaultLang);
    const router = useRouter();

    const current =
        group.versions.find((v) => v.language === selectedLang) ??
        group.versions[0];

    async function handleDelete() {
        if (!confirm('Delete this language version? This cannot be undone.'))
            return;
        const res = await fetch(`/api/admin/posts/${current.id}`, {
            method: 'DELETE',
        });
        if (res.ok) router.refresh();
        else alert('Failed to delete post');
    }

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td className="max-w-[180px] px-4 py-3 md:max-w-xs md:px-6 md:py-4">
                <p className="truncate font-medium text-gray-900 dark:text-white">
                    {current.title}
                </p>
                <p className="truncate text-xs text-gray-400">/{current.slug}</p>
            </td>

            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 md:px-6 md:py-4">
                {current.category?.name ?? '—'}
            </td>

            <td className="hidden px-4 py-3 text-gray-500 dark:text-gray-400 md:table-cell md:px-6 md:py-4">
                {current.author?.username ?? '—'}
            </td>

            <td className="px-4 py-3 md:px-6 md:py-4">
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        current.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                >
                    {current.status.toLowerCase()}
                </span>
            </td>

            {/* Language selector — clicking a badge switches the active row data */}
            <td className="px-4 py-3 md:px-6 md:py-4">
                <div className="flex flex-wrap gap-1">
                    {group.versions.map((v) => (
                        <button
                            key={v.language}
                            onClick={() => setSelectedLang(v.language)}
                            className={`rounded px-1.5 py-0.5 text-xs font-bold transition-colors ${
                                v.language === selectedLang
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                            title={`Edit ${v.language.toUpperCase()} version`}
                        >
                            {LOCALE_SHORT[v.language as keyof typeof LOCALE_SHORT] ??
                                v.language.toUpperCase()}
                        </button>
                    ))}
                </div>
            </td>

            <td className="hidden px-4 py-3 md:table-cell md:px-6 md:py-4">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Eye className="h-3 w-3" />
                    {current.views}
                </span>
            </td>

            <td className="hidden px-4 py-3 text-gray-500 dark:text-gray-400 md:table-cell md:px-6 md:py-4">
                {formatDate(new Date(current.createdAt))}
            </td>

            <td className="px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center gap-1">
                    {current.status === 'PUBLISHED' && (
                        <Link
                            href={`/posts/${current.slug}`}
                            target="_blank"
                            className="rounded p-1 text-gray-400 hover:text-blue-600"
                            title="View"
                        >
                            <Eye className="h-4 w-4" />
                        </Link>
                    )}
                    <Link
                        href={`/admin/posts/${current.id}/edit`}
                        className="rounded p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="rounded p-1 text-gray-400 hover:text-red-600"
                        title="Delete this version"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function PostsTableClient({
    groups,
}: {
    groups: PostGroup[];
}) {
    if (groups.length === 0) {
        return (
            <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No posts yet.{' '}
                    <Link
                        href="/admin/posts/new"
                        className="text-blue-600 hover:underline"
                    >
                        Create your first post
                    </Link>
                </td>
            </tr>
        );
    }

    return (
        <>
            {groups.map((group) => (
                <PostGroupRow key={group.gid} group={group} />
            ))}
        </>
    );
}
