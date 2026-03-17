import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    const session = await getSession();
    if (!session)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    const { id } = await params;
    const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
        include: {
            category: true,
            images: true,
            postTags: { include: { tag: true } },
        },
    });
    if (!post)
        return NextResponse.json(
            { error: 'Not found' },
            { status: 404 }
        );
    return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Params) {
    const session = await getSession();
    if (!session)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    const { id } = await params;
    const postId = parseInt(id);
    try {
        const body = await req.json();
        const {
            title,
            slug,
            content,
            excerpt,
            thumbnail,
            status,
            language,
            translationGroupId,
            categoryId: rawCategoryId,
            tags,
            images,
        } = body;

        const categoryId: number | null = rawCategoryId ?? null;

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

        await prisma.postTag.deleteMany({ where: { postId } });
        await prisma.postImage.deleteMany({ where: { postId } });

        const existing = await prisma.post.findUnique({
            where: { id: postId },
            select: { status: true, publishedAt: true, slug: true, translationGroupId: true },
        });

        const newSlug = slug || slugify(title);

        // If slug changed and post has siblings, propagate to all versions
        if (
            existing?.slug !== newSlug &&
            existing?.translationGroupId
        ) {
            await prisma.post.updateMany({
                where: {
                    translationGroupId: existing.translationGroupId,
                    id: { not: postId },
                },
                data: { slug: newSlug },
            });
        }

        const post = await prisma.post.update({
            where: { id: postId },
            data: {
                title,
                slug: newSlug,
                content,
                excerpt: excerpt || null,
                thumbnail: thumbnail || null,
                status: status || 'DRAFT',
                language: language || 'vi',
                ...(translationGroupId != null ? { translationGroupId } : {}),
                categoryId,
                publishedAt:
                    status === 'PUBLISHED'
                        ? existing?.publishedAt ?? new Date()
                        : null,
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
        return NextResponse.json(post);
    } catch (err: unknown) {
        if (
            typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            (err as { code: string }).code === 'P2002'
        ) {
            return NextResponse.json(
                { error: 'A post with this slug already exists for this language.' },
                { status: 409 }
            );
        }
        console.error(err);
        return NextResponse.json(
            { error: 'Failed to update post' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { status } = await req.json();
    if (status !== 'DRAFT' && status !== 'PUBLISHED')
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    const post = await prisma.post.update({
        where: { id: parseInt(id) },
        data: {
            status,
            publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
        },
    });
    return NextResponse.json({ id: post.id, status: post.status });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    const session = await getSession();
    if (!session)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    const { id } = await params;
    try {
        await prisma.post.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: 'Failed to delete post' },
            { status: 500 }
        );
    }
}
