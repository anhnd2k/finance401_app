import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { PlusCircle, Eye, Pencil } from 'lucide-react';
import DeletePostButton from './DeletePostButton';

export default async function AdminPostsPage() {
    const posts = await prisma.post.findMany({
        include: {
            category: true,
            author: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
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
                                <th className="hidden px-4 py-3 md:table-cell md:px-6">Views</th>
                                <th className="hidden px-4 py-3 md:table-cell md:px-6">Date</th>
                                <th className="px-4 py-3 md:px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {posts.map((post) => (
                                <tr
                                    key={post.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <td className="max-w-[180px] px-4 py-3 md:max-w-xs md:px-6 md:py-4">
                                        <p className="truncate font-medium text-gray-900 dark:text-white">
                                            {post.title}
                                        </p>
                                        <p className="truncate text-xs text-gray-400">
                                            /{post.slug}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 md:px-6 md:py-4">
                                        {post.category?.name ?? '—'}
                                    </td>
                                    <td className="hidden px-4 py-3 text-gray-500 dark:text-gray-400 md:table-cell md:px-6 md:py-4">
                                        {post.author?.username ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                post.status === 'PUBLISHED'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}
                                        >
                                            {post.status.toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="hidden px-4 py-3 md:table-cell md:px-6 md:py-4">
                                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                            <Eye className="h-3 w-3" />
                                            {post.views}
                                        </span>
                                    </td>
                                    <td className="hidden px-4 py-3 text-gray-500 dark:text-gray-400 md:table-cell md:px-6 md:py-4">
                                        {formatDate(post.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4">
                                        <div className="flex items-center gap-1">
                                            {post.status === 'PUBLISHED' && (
                                                <Link
                                                    href={`/posts/${post.slug}`}
                                                    target="_blank"
                                                    className="rounded p-1 text-gray-400 hover:text-blue-600"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            )}
                                            <Link
                                                href={`/admin/posts/${post.id}/edit`}
                                                className="rounded p-1 text-gray-400 hover:text-blue-600"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <DeletePostButton id={post.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-8 text-center text-gray-400"
                                    >
                                        No posts yet.{' '}
                                        <Link
                                            href="/admin/posts/new"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Create your first post
                                        </Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
