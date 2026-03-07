import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
    const session = await getSession();
    if (!session)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    const posts = await prisma.post.findMany({
        include: {
            category: true,
            author: { select: { id: true, username: true } },
            postTags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    try {
        const body = await req.json();
        const {
            title,
            slug,
            content,
            excerpt,
            thumbnail,
            status,
            categoryName,
            tags,
            images,
        } = body;

        let categoryId: number | null = null;
        if (categoryName?.trim()) {
            const catSlug = slugify(categoryName);
            const cat = await prisma.category.upsert({
                where: { slug: catSlug },
                update: {},
                create: { name: categoryName.trim(), slug: catSlug },
            });
            categoryId = cat.id;
        }

        const tagIds: number[] = [];
        if (Array.isArray(tags)) {
            for (const tagName of tags) {
                if (!tagName?.trim()) continue;
                const tagSlug = slugify(tagName);
                const tag = await prisma.tag.upsert({
                    where: { slug: tagSlug },
                    update: {},
                    create: { name: tagName.trim(), slug: tagSlug },
                });
                tagIds.push(tag.id);
            }
        }

        const post = await prisma.post.create({
            data: {
                title,
                slug: slug || slugify(title),
                content,
                excerpt: excerpt || null,
                thumbnail: thumbnail || null,
                status: status || 'DRAFT',
                categoryId,
                authorId: session.userId,
                publishedAt:
                    status === 'PUBLISHED' ? new Date() : null,
                images: {
                    create: ((images as string[]) || [])
                        .filter(Boolean)
                        .map((url) => ({ url })),
                },
                postTags: {
                    create: tagIds.map((tagId) => ({ tagId })),
                },
            },
        });
        return NextResponse.json(post, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}
