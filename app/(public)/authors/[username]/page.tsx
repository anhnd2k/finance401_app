import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Eye, Clock, User } from 'lucide-react';
import { getLocale } from '@/lib/locale.server';
import { getT } from '@/lib/i18n';
import { localePath } from '@/lib/locale';

interface Props {
    params: Promise<{ username: string }>;
}

export default async function AuthorPage({ params }: Props) {
    const { username } = await params;

    const userLang = await getLocale();
    const t = getT(userLang);

    const author = await prisma.user.findUnique({
        where: { username },
        select: {
            username: true,
            displayName: true,
            createdAt: true,
            _count: { select: { posts: true } },
        },
    });

    if (!author) notFound();

    const posts = await prisma.post.findMany({
        where: { status: 'PUBLISHED', language: userLang, author: { username } },
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
    });

    const displayName = author.displayName ?? author.username;

    return (
        <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900/30">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Author card */}
                <div className="mb-10 flex items-center gap-6 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
                        {displayName[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {displayName}
                        </h1>
                        {author.displayName && (
                            <p className="text-sm text-gray-400">@{author.username}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {author._count.posts} {t.posts}
                            </span>
                            <span>{t.joinedOn} {formatDate(author.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Posts list */}
                <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
                    {t.allPostsBy} {displayName}
                </h2>

                {posts.length === 0 ? (
                    <p className="text-center text-gray-400 py-16">{t.noPublishedPosts}</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                            >
                                <Link
                                    href={localePath(`/posts/${post.slug}`, userLang)}
                                    className="absolute inset-0 z-0"
                                    aria-label={post.title}
                                />
                                <div className="flex gap-4 p-5">
                                    {post.thumbnail && (
                                        <div className="hidden h-24 w-36 shrink-0 overflow-hidden rounded-lg sm:block">
                                            <img
                                                src={post.thumbnail}
                                                alt={post.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        {post.category && (
                                            <Link
                                                href={localePath(`/posts?category=${post.category.slug}`, userLang)}
                                                className="relative z-10 mb-1 inline-block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {post.category.name}
                                            </Link>
                                        )}
                                        <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {post.publishedAt
                                                    ? formatDate(post.publishedAt)
                                                    : '—'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {post.views.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
