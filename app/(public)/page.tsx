import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import {
    Eye,
    Clock,
    TrendingUp,
} from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
    const [latestPosts, topPosts] =
        await Promise.all([
            prisma.post.findMany({
                where: { status: 'PUBLISHED' },
                include: {
                    category: true,
                    author: {
                        select: {
                            username: true,
                        },
                    },
                },
                orderBy: { publishedAt: 'desc' },
                take: 6,
            }),
            prisma.post.findMany({
                where: { status: 'PUBLISHED' },
                include: { category: true },
                orderBy: { views: 'desc' },
                take: 5,
            }),
        ]);

    return (
        <div className="min-h-screen">
            {/* Latest Posts */}
            <section className="bg-gray-50 py-16 dark:bg-gray-900/30">
                <div className="container mx-auto px-4">
                    <div className="mb-10">
                        <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                            Latest Posts
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Fresh insights from
                            the world of Finance
                        </p>
                    </div>

                    {latestPosts.length === 0 ? (
                        <p className="text-gray-400 dark:text-gray-500">
                            No posts published
                            yet. Check back soon!
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {latestPosts.map(
                                (post) => (
                                    <PostCard
                                        key={
                                            post.id
                                        }
                                        post={
                                            post
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Most Viewed */}
            {topPosts.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="mb-10 flex items-center gap-3">
                            <TrendingUp className="h-7 w-7 text-blue-600" />
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Most Viewed
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Top posts our
                                    readers love
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {topPosts.map(
                                (post, i) => (
                                    <TopPostItem
                                        key={
                                            post.id
                                        }
                                        post={
                                            post
                                        }
                                        rank={
                                            i + 1
                                        }
                                    />
                                )
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

type PostWithMeta = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    views: number;
    publishedAt: Date | null;
    category: {
        name: string;
        slug: string;
    } | null;
    author?: { username: string } | null;
};

function PostCard({
    post,
}: {
    post: PostWithMeta;
}) {
    return (
        <Link href={`/posts/${post.slug}`}>
            <article className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                {post.thumbnail ? (
                    <div className="h-48 w-full overflow-hidden">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30" />
                )}

                <div className="p-6">
                    {post.category && (
                        <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {post.category.name}
                        </span>
                    )}

                    <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {post.title}
                    </h3>

                    {post.excerpt && (
                        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.publishedAt
                                ? formatDate(
                                      post.publishedAt
                                  )
                                : '—'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views.toLocaleString()}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

function TopPostItem({
    post,
    rank,
}: {
    post: PostWithMeta;
    rank: number;
}) {
    return (
        <Link href={`/posts/${post.slug}`}>
            <article className="group flex items-center gap-6 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                    {rank}
                </span>

                {post.thumbnail && (
                    <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg sm:block">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    {post.category && (
                        <span className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                            {post.category.name}
                        </span>
                    )}
                    <h3 className="line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {post.title}
                    </h3>
                </div>

                <div className="flex shrink-0 items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Eye className="h-4 w-4" />
                    <span>
                        {post.views.toLocaleString()}
                    </span>
                </div>
            </article>
        </Link>
    );
}
