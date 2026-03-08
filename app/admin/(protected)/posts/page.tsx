import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import PostsTableClient, { type PostGroup } from './PostsTableClient';

export default async function AdminPostsPage() {
    const posts = await prisma.post.findMany({
        include: {
            category: true,
            author: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Group posts by translationGroupId (one row per "topic")
    const groupMap = new Map<number, PostGroup['versions']>();
    for (const post of posts) {
        const gid = post.translationGroupId ?? post.id;
        if (!groupMap.has(gid)) groupMap.set(gid, []);
        groupMap.get(gid)!.push({
            id: post.id,
            title: post.title,
            slug: post.slug,
            language: post.language,
            status: post.status,
            views: post.views,
            createdAt: post.createdAt.toISOString(),
            category: post.category,
            author: post.author,
        });
    }

    // Sort groups by most recently created version
    const groups: PostGroup[] = Array.from(groupMap.entries())
        .map(([gid, versions]) => ({ gid, versions }))
        .sort((a, b) => {
            const aMax = Math.max(
                ...a.versions.map((v) => new Date(v.createdAt).getTime())
            );
            const bMax = Math.max(
                ...b.versions.map((v) => new Date(v.createdAt).getTime())
            );
            return bMax - aMax;
        });

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                    Posts
                </h1>
                <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">New Post</span>
                    <span className="sm:hidden">New</span>
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                <th className="px-4 py-3 md:px-6">Title</th>
                                <th className="px-4 py-3 md:px-6">Category</th>
                                <th className="hidden px-4 py-3 md:table-cell md:px-6">Author</th>
                                <th className="px-4 py-3 md:px-6">Status</th>
                                <th className="px-4 py-3 md:px-6">Languages</th>
                                <th className="hidden px-4 py-3 md:table-cell md:px-6">Views</th>
                                <th className="hidden px-4 py-3 md:table-cell md:px-6">Date</th>
                                <th className="px-4 py-3 md:px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            <PostsTableClient groups={groups} />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
