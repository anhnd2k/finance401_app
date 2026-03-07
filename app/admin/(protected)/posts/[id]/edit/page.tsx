import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PostForm from '../../PostForm';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
    const { id } = await params;
    const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
        include: {
            category: true,
            images: true,
            postTags: { include: { tag: true } },
        },
    });

    if (!post) notFound();

    const initialData = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? '',
        content: post.content,
        thumbnail: post.thumbnail ?? '',
        status: post.status,
        categoryName: post.category?.name ?? '',
        tags: post.postTags.map((pt) => pt.tag.name).join(', '),
        images: post.images.map((img) => img.url).join('\n'),
    };

    return (
        <div className="p-8">
            <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                Edit Post
            </h1>
            <PostForm initialData={initialData} />
        </div>
    );
}
