import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Eye, Clock } from 'lucide-react';
import PostsFilter from './PostsFilter';

interface Props {
    searchParams: Promise<{
        sort?: string;
        category?: string;
    }>;
}

export default async function AllPostsPage({ searchParams }: Props) {
    const { sort = 'newest', category = '' } = await searchParams;

    const orderBy =
        sort === 'oldest'
            ? { publishedAt: 'asc' as const }
            : sort === 'popular'
              ? { views: 'desc' as const }
              : { publishedAt: 'desc' as const };

    const [posts, categories] = await Promise.all([
        prisma.post.findMany({
            where: {
                status: 'PUBLISHED',
                ...(category
                    ? { category: { slug: category } }
                    : {}),
            },
            include: {
                category: true,
                author: { select: { username: true } },
            },
            orderBy,
        }),
        prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900/30">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            All Posts
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {posts.length}{' '}
                            {posts.length === 1 ? 'post' : 'posts'} found
                        </p>
                    </div>

                    <Suspense fallback={null}>
                        <PostsFilter categories={categories} />
                    </Suspense>
                </div>

                {/* Grid */}
                {posts.length === 0 ? (
                    <div className="py-24 text-center text-gray-400">
                        No posts found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/posts/${post.slug}`}
                            >
                                <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                                    {post.thumbnail ? (
                                        <div className="h-44 w-full overflow-hidden">
                                            <img
                                                src={post.thumbnail}
                                                alt={post.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-44 w-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30" />
                                    )}

                                    <div className="p-5">
                                        {post.category && (
                                            <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                {post.category.name}
                                            </span>
                                        )}
                                        <h2 className="mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                            {post.title}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-800">
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
