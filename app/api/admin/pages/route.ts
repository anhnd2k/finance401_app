import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const language = searchParams.get('language');

    if (!key || !language)
        return NextResponse.json(
            { error: 'Missing key or language' },
            { status: 400 }
        );

    const page = await prisma.sitePage.findUnique({
        where: { key_language: { key, language } },
    });

    return NextResponse.json(page ?? { key, language, content: '' });
}

export async function PUT(req: NextRequest) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { key, language, content } = await req.json();

    if (!key || !language)
        return NextResponse.json(
            { error: 'Missing key or language' },
            { status: 400 }
        );

    const page = await prisma.sitePage.upsert({
        where: { key_language: { key, language } },
        update: { content },
        create: { key, language, content },
    });

    return NextResponse.json(page);
}
