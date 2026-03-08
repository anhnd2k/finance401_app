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
            language,
            translationGroupId,
            categoryId,
            tags,
            images,
        } = body;

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

        // Create the post first
        const post = await prisma.post.create({
            data: {
                title,
                slug: slug || slugify(title),
                content,
                excerpt: excerpt || null,
                thumbnail: thumbnail || null,
                status: status || 'DRAFT',
                language: language || 'vi',
                // Use provided translationGroupId or will self-assign below
                translationGroupId: translationGroupId ?? null,
                categoryId: categoryId ?? null,
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

        // Self-assign translationGroupId if not provided (standalone post)
        if (!translationGroupId) {
            await prisma.post.update({
                where: { id: post.id },
                data: { translationGroupId: post.id },
            });
        }

        return NextResponse.json(post, { status: 201 });
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
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}
