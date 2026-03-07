import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN')
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    const { id } = await params;
    const userId = parseInt(id);
    if (session.userId === userId)
        return NextResponse.json(
            { error: 'Cannot delete your own account' },
            { status: 400 }
        );
    try {
        await prisma.user.delete({ where: { id: userId } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
