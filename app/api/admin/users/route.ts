import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN')
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN')
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    try {
        const { username, password, role, displayName } = await req.json();
        if (!username || !password)
            return NextResponse.json(
                { error: 'Username and password required' },
                { status: 400 }
            );
        const hashedPassword = await hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                displayName: displayName?.trim() || null,
                password: hashedPassword,
                role: (role as Role) || Role.WRITER,
            },
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });
        return NextResponse.json(user, { status: 201 });
    } catch (err: unknown) {
        if (
            typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            (err as { code: string }).code === 'P2002'
        ) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
