import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 2) return NextResponse.json([]);

    const posts = await prisma.post.findMany({
        where: {
            status: 'PUBLISHED',
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                {
                    postTags: {
                        some: {
                            tag: {
                                name: {
                                    contains: q,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                },
                { excerpt: { contains: q, mode: 'insensitive' } },
            ],
        },
        select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            category: { select: { name: true } },
        },
        orderBy: { views: 'desc' },
        take: 8,
    });

    return NextResponse.json(posts);
}
