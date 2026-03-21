import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Eye, CalendarDays, User, Tag, TrendingUp } from 'lucide-react';
import ViewTracker from '@/components/ViewTracker';
import LangGate from './LangGate';
import { isValidLocale, DEFAULT_LOCALE, localePath, type Locale } from '@/lib/locale';
import { getLocale } from '@/lib/locale.server';
import { getT } from '@/lib/i18n';

export const revalidate = 0;

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function PostDetail({ params }: Props) {
    const { slug } = await params;

    // Determine user's language (x-locale header from middleware or cookie)
    const userLang: Locale = await getLocale();

    // Try to fetch the post in the user's language
    const post = await prisma.post.findFirst({
        where: { slug, status: 'PUBLISHED', language: userLang },
        include: {
            category: true,
            author: { select: { username: true, displayName: true } },
            images: true,
            postTags: { include: { tag: true } },
        },
    });

    // If not found in user's language, check if another language version exists
    if (!post) {
        const otherVersion = await prisma.post.findFirst({
            where: { slug, status: 'PUBLISHED' },
            select: { id: true, language: true },
        });
        if (!otherVersion) notFound();
        const postLang: Locale = isValidLocale(otherVersion.language)
            ? otherVersion.language
            : DEFAULT_LOCALE;
        return (
            <>
                <ViewTracker postId={otherVersion.id} />
                <div className="container mx-auto px-4">
                    <LangGate postLang={postLang} userLang={userLang} />
                </div>
            </>
        );
    }

    const tagIds = post.postTags.map((pt) => pt.tagId);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [relatedByCategory, related, topThisMonth] = await Promise.all([
        // Left sidebar: same-category posts by views
        post.categoryId
            ? prisma.post.findMany({
                  where: {
                      status: 'PUBLISHED',
                      language: userLang,
                      categoryId: post.categoryId,
                      id: { not: post.id },
                  },
                  orderBy: { views: 'desc' },
                  take: 5,
              })
            : Promise.resolve([]),

        // Bottom horizontal scroll: related by tags or category
        tagIds.length > 0
            ? prisma.post.findMany({
                  where: {
                      status: 'PUBLISHED',
                      language: userLang,
                      id: { not: post.id },
                      OR: [
                          { postTags: { some: { tagId: { in: tagIds } } } },
                          ...(post.categoryId
                              ? [{ categoryId: post.categoryId }]
                              : []),
                      ],
                  },
                  include: { category: true },
                  orderBy: { views: 'desc' },
                  take: 5,
              })
            : post.categoryId
              ? prisma.post.findMany({
                    where: {
                        status: 'PUBLISHED',
                        language: userLang,
                        id: { not: post.id },
                        categoryId: post.categoryId,
                    },
                    include: { category: true },
                    orderBy: { views: 'desc' },
                    take: 5,
                })
              : prisma.post.findMany({
                    where: { status: 'PUBLISHED', language: userLang, id: { not: post.id } },
                    include: { category: true },
                    orderBy: { views: 'desc' },
                    take: 5,
                }),

        // Right sidebar: top 3 most viewed this month
        prisma.post.findMany({
            where: {
                status: 'PUBLISHED',
                language: userLang,
                id: { not: post.id },
                publishedAt: { gte: startOfMonth },
            },
            orderBy: { views: 'desc' },
            take: 3,
        }),
    ]);

    const authorName = post.author?.displayName ?? post.author?.username;
    const t = getT(userLang);

    return (
        <>
            <ViewTracker postId={post.id} />
            <div className="container mx-auto px-4 py-10 xl:max-w-7xl">
                <div className="flex flex-col gap-10 xl:flex-row">
                    {/* Left sidebar — same-category */}
                    {relatedByCategory.length > 0 && (
                        <aside className="w-full shrink-0 xl:w-52">
                            <div className="xl:sticky xl:top-24">
                                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    {post.category?.name ?? 'In This Category'}
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {relatedByCategory.map((p) => (
                                        <Link
                                            key={p.id}
                                            href={localePath(`/posts/${p.slug}`, userLang)}
                                            className="group block rounded-lg border border-gray-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                                        >
                                            {p.thumbnail && (
                                                <div className="mb-2 h-20 w-full overflow-hidden rounded">
                                                    <img
                                                        src={p.thumbnail}
                                                        alt={p.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <p className="mb-1 line-clamp-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
                                                {p.title}
                                            </p>
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Eye className="h-3 w-3" />
                                                {p.views.toLocaleString()}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Main content */}
                    <article className="min-w-0 flex-1">
                        {/* Meta */}
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            {post.category && (
                                <Link
                                    href={localePath(`/posts?category=${post.category.slug}`, userLang)}
                                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                                >
                                    {post.category.name}
                                </Link>
                            )}
                        </div>

                        <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl">
                            {post.title}
                        </h1>

                        <div className="mb-8 flex flex-wrap items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
                            {authorName && (
                                <Link
                                    href={localePath(`/authors/${post.author!.username}`, userLang)}
                                    className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                        {authorName[0]?.toUpperCase()}
                                    </div>
                                    <User className="h-3.5 w-3.5" />
                                    {authorName}
                                </Link>
                            )}
                            {post.publishedAt && (
                                <span className="flex items-center gap-1">
                                    <CalendarDays className="h-4 w-4" />
                                    {formatDate(post.publishedAt)}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {post.views.toLocaleString()} {t.views}
                            </span>
                        </div>

                        {/* Thumbnail */}
                        {post.thumbnail && (
                            <div className="mb-8 overflow-hidden rounded-xl">
                                <img
                                    src={post.thumbnail}
                                    alt={post.title}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-lg max-w-none break-words dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Additional images */}
                        {post.images.length > 0 && (
                            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {post.images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="overflow-hidden rounded-xl"
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.alt ?? post.title}
                                            className="w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tags */}
                        {post.postTags.length > 0 && (
                            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-6 dark:border-gray-800">
                                <Tag className="h-4 w-4 text-gray-400" />
                                {post.postTags.map(({ tag }) => (
                                    <Link
                                        key={tag.id}
                                        href={localePath(`/posts?tag=${tag.slug}`, userLang)}
                                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        {tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Related posts — horizontal scroll */}
                        {related.length > 0 && (
                            <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
                                <h2 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">
                                    {t.relatedPosts}
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-3">
                                    {related.map((p) => (
                                        <Link
                                            key={p.id}
                                            href={localePath(`/posts/${p.slug}`, userLang)}
                                            className="group w-52 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                                        >
                                            {p.thumbnail ? (
                                                <div className="h-32 w-full overflow-hidden">
                                                    <img
                                                        src={p.thumbnail}
                                                        alt={p.title}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-32 w-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30" />
                                            )}
                                            <div className="p-3">
                                                {p.category && (
                                                    <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                                        {p.category.name}
                                                    </p>
                                                )}
                                                <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                    {p.title}
                                                </h3>
                                                <span className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                    <Eye className="h-3 w-3" />
                                                    {p.views.toLocaleString()}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Right sidebar — top this month */}
                    {topThisMonth.length > 0 && (
                        <aside className="w-full shrink-0 xl:w-52">
                            <div className="xl:sticky xl:top-24">
                                <h2 className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    {t.trendingThisMonth}
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {topThisMonth.map((p, i) => (
                                        <Link
                                            key={p.id}
                                            href={localePath(`/posts/${p.slug}`, userLang)}
                                            className="group flex gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                                {i + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="line-clamp-3 text-sm font-medium text-gray-800 transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
                                                    {p.title}
                                                </p>
                                                <span className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                                    <Eye className="h-3 w-3" />
                                                    {p.views.toLocaleString()}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </>
    );
}
