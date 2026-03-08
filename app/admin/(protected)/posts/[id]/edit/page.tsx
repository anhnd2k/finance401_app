import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import MultiPanelEditor, { type PanelVersion } from '../../MultiPanelEditor';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
    const { id } = await params;
    const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
        include: {
            images: true,
            postTags: { include: { tag: true } },
        },
    });

    if (!post) notFound();

    // Fetch all versions in the same translation group
    const groupId = post.translationGroupId ?? post.id;
    const allVersionsRaw = await prisma.post.findMany({
        where: post.translationGroupId
            ? { translationGroupId: groupId }
            : { id: post.id },
        include: {
            images: true,
            postTags: { include: { tag: true } },
        },
    });

    const allVersions: PanelVersion[] = allVersionsRaw.map((v) => ({
        id: v.id,
        language: v.language,
        title: v.title,
        slug: v.slug,
        excerpt: v.excerpt ?? '',
        content: v.content,
        thumbnail: v.thumbnail ?? '',
        status: v.status,
        categoryId: v.categoryId ?? null,
        tagNames: v.postTags.map((pt) => pt.tag.name),
        images: v.images.map((img) => img.url).join('\n'),
        translationGroupId: v.translationGroupId,
    }));

    const baseData = {
        slug: post.slug,
        title: post.title,
        thumbnail: post.thumbnail ?? '',
        categoryId: post.categoryId ?? null,
        tagNames: post.postTags.map((pt) => pt.tag.name),
        images: post.images.map((img) => img.url).join('\n'),
        translationGroupId: groupId,
    };

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Post
                </h1>
                <Link
                    href="/admin/posts"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    ← Back to Posts
                </Link>
            </div>
            <MultiPanelEditor
                allVersions={allVersions}
                defaultLang={post.language}
                baseData={baseData}
            />
        </div>
    );
}
