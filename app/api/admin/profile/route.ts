import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { hash, compare } from 'bcryptjs';

export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { displayName, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updates: { displayName?: string | null; password?: string } = {};

    if (displayName !== undefined) {
        updates.displayName = displayName?.trim() || null;
    }

    if (newPassword) {
        if (!currentPassword)
            return NextResponse.json(
                { error: 'Current password is required' },
                { status: 400 }
            );
        const valid = await compare(currentPassword, user.password);
        if (!valid)
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        updates.password = await hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
        where: { id: session.userId },
        data: updates,
        select: { id: true, username: true, displayName: true, role: true },
    });

    return NextResponse.json(updated);
}
