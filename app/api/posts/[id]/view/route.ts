import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.post.update({
            where: { id: parseInt(id) },
            data: { views: { increment: 1 } },
        });
    } catch {
        // ignore if post not found
    }
    return NextResponse.json({ ok: true });
}
