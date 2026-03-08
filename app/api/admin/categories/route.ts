import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { posts: true } } },
    });
    return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { name } = await req.json();
    if (!name?.trim())
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const slug = slugify(name.trim());
    try {
        const cat = await prisma.category.create({
            data: { name: name.trim(), slug },
        });
        return NextResponse.json(cat, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Category with that name already exists' },
            { status: 409 }
        );
    }
}
