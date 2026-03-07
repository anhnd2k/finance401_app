import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password required' },
                { status: 400 }
            );
        }
        const user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user || !(await compare(password, user.password))) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }
        const token = await createSessionToken(
            user.id,
            user.username,
            user.role
        );
        const res = NextResponse.json({ success: true });
        res.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });
        return res;
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}
