import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import {
    Eye,
    CalendarDays,
    User,
    Tag,
} from 'lucide-react';
import ViewTracker from '@/components/ViewTracker';

export const revalidate = 0;

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function PostDetail({
    params,
}: Props) {
    const { slug } = await params;

    const post = await prisma.post.findUnique({
        where: { slug, status: 'PUBLISHED' },
        include: {
            category: true,
            author: {
                select: { username: true },
            },
            images: true,
            postTags: { include: { tag: true } },
        },
    });

    if (!post) notFound();

    // Posts from same category (by views, excluding current)
    const relatedByCategory = post.categoryId
        ? await prisma.post.findMany({
              where: {
                  status: 'PUBLISHED',
                  categoryId: post.categoryId,
                  id: { not: post.id },
              },
              include: { category: true },
              orderBy: { views: 'desc' },
              take: 5,
          })
        : [];

    // Recommended: posts sharing at least one tag
    const tagIds = post.postTags.map(
        (pt) => pt.tagId
    );
    const recommended =
        tagIds.length > 0
            ? await prisma.post.findMany({
                  where: {
                      status: 'PUBLISHED',
                      id: { not: post.id },
                      postTags: {
                          some: {
                              tagId: {
                                  in: tagIds,
                              },
                          },
                      },
                  },
                  include: { category: true },
                  orderBy: { views: 'desc' },
                  take: 4,
              })
            : await prisma.post.findMany({
                  where: {
                      status: 'PUBLISHED',
                      id: { not: post.id },
                  },
                  include: { category: true },
                  orderBy: { views: 'desc' },
                  take: 4,
              });

    return (
        <>
            <ViewTracker postId={post.id} />
            <div className="container mx-auto py-12 lg:px-60">
                <div className="flex flex-col gap-10 lg:flex-row">
                    {/* Sidebar — Same category posts */}
                    {relatedByCategory.length >
                        0 && (
                        <aside className="w-full shrink-0 lg:w-64">
                            <div className="sticky top-24">
                                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    {post.category
                                        ?.name ??
                                        'Related'}
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {relatedByCategory.map(
                                        (p) => (
                                            <Link
                                                key={
                                                    p.id
                                                }
                                                href={`/posts/${p.slug}`}
                                                className="group block rounded-lg border border-gray-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                                            >
                                                {p.thumbnail && (
                                                    <div className="mb-2 h-24 w-full overflow-hidden rounded">
                                                        <img
                                                            src={
                                                                p.thumbnail
                                                            }
                                                            alt={
                                                                p.title
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <p className="mb-1 line-clamp-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
                                                    {
                                                        p.title
                                                    }
                                                </p>
                                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Eye className="h-3 w-3" />
                                                    {p.views.toLocaleString()}
                                                </span>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Main content */}
                    <article className="min-w-0 flex-1">
                        {/* Meta */}
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            {post.category && (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    {
                                        post
                                            .category
                                            .name
                                    }
                                </span>
                            )}
                        </div>

                        <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl">
                            {post.title}
                        </h1>

                        <div className="mb-8 flex flex-wrap items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
                            {post.author && (
                                <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {
                                        post
                                            .author
                                            .username
                                    }
                                </span>
                            )}
                            {post.publishedAt && (
                                <span className="flex items-center gap-1">
                                    <CalendarDays className="h-4 w-4" />
                                    {formatDate(
                                        post.publishedAt
                                    )}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {post.views.toLocaleString()}{' '}
                                views
                            </span>
                        </div>

                        {/* Thumbnail */}
                        {post.thumbnail && (
                            <div className="mb-8 overflow-hidden rounded-xl">
                                <img
                                    src={
                                        post.thumbnail
                                    }
                                    alt={
                                        post.title
                                    }
                                    className="w-full"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
                            dangerouslySetInnerHTML={{
                                __html: post.content,
                            }}
                        />

                        {/* Additional images */}
                        {post.images.length >
                            0 && (
                            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {post.images.map(
                                    (img) => (
                                        <div
                                            key={
                                                img.id
                                            }
                                            className="overflow-hidden rounded-xl"
                                        >
                                            <img
                                                src={
                                                    img.url
                                                }
                                                alt={
                                                    img.alt ??
                                                    post.title
                                                }
                                                className="w-full object-cover"
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* Tags */}
                        {post.postTags.length >
                            0 && (
                            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-6 dark:border-gray-800">
                                <Tag className="h-4 w-4 text-gray-400" />
                                {post.postTags.map(
                                    ({ tag }) => (
                                        <span
                                            key={
                                                tag.id
                                            }
                                            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                        >
                                            {
                                                tag.name
                                            }
                                        </span>
                                    )
                                )}
                            </div>
                        )}
                    </article>
                </div>

                {/* Recommended posts */}
                {recommended.length > 0 && (
                    <section className="mt-16 border-t border-gray-200 pt-12 dark:border-gray-800">
                        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                            Recommended Posts
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {recommended.map(
                                (p) => (
                                    <Link
                                        key={p.id}
                                        href={`/posts/${p.slug}`}
                                        className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                                    >
                                        {p.thumbnail ? (
                                            <div className="h-36 w-full overflow-hidden">
                                                <img
                                                    src={
                                                        p.thumbnail
                                                    }
                                                    alt={
                                                        p.title
                                                    }
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-36 w-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30" />
                                        )}
                                        <div className="p-4">
                                            {p.category && (
                                                <span className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                                    {
                                                        p
                                                            .category
                                                            .name
                                                    }
                                                </span>
                                            )}
                                            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                {
                                                    p.title
                                                }
                                            </h3>
                                            <span className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                <Eye className="h-3 w-3" />
                                                {p.views.toLocaleString()}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
