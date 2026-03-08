import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileText, Users, Eye, PlusCircle } from 'lucide-react';

export default async function AdminDashboard() {
    const [totalPosts, publishedPosts, draftPosts, totalUsers, totalViews] =
        await Promise.all([
            prisma.post.count(),
            prisma.post.count({ where: { status: 'PUBLISHED' } }),
            prisma.post.count({ where: { status: 'DRAFT' } }),
            prisma.user.count(),
            prisma.post.aggregate({ _sum: { views: true } }),
        ]);

    const recentPosts = await prisma.post.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    const stats = [
        {
            label: 'Total Posts',
            value: totalPosts,
            sub: `${publishedPosts} published · ${draftPosts} drafts`,
            icon: FileText,
            color: 'bg-blue-500',
        },
        {
            label: 'Total Users',
            value: totalUsers,
            sub: 'Admin & Writers',
            icon: Users,
            color: 'bg-green-500',
        },
        {
            label: 'Total Views',
            value: (totalViews._sum.views ?? 0).toLocaleString(),
            sub: 'Across all posts',
            icon: Eye,
            color: 'bg-purple-500',
        },
    ];

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Welcome back! Here&apos;s an overview.
                </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div
                            key={s.label}
                            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {s.label}
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                                        {s.value}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {s.sub}
                                    </p>
                                </div>
                                <div
                                    className={`rounded-lg p-3 ${s.color}`}
                                >
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick actions */}
            <div className="mb-8 flex gap-3">
                <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    <PlusCircle className="h-4 w-4" />
                    New Post
                </Link>
                <Link
                    href="/admin/users/new"
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                    <Users className="h-4 w-4" />
                    New User
                </Link>
            </div>

            {/* Recent posts */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                        Recent Posts
                    </h2>
                    <Link
                        href="/admin/posts"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                        View all
                    </Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentPosts.map((post) => (
                        <div
                            key={post.id}
                            className="flex items-center justify-between px-6 py-3"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {post.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {post.category?.name ?? 'Uncategorized'}
                                </p>
                            </div>
                            <span
                                className={`ml-4 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                    post.status === 'PUBLISHED'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}
                            >
                                {post.status.toLowerCase()}
                            </span>
                        </div>
                    ))}
                    {recentPosts.length === 0 && (
                        <p className="px-6 py-4 text-sm text-gray-400">
                            No posts yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
