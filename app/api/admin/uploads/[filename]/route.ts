import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { filename } = await params;

    // Prevent path traversal
    if (filename.includes('/') || filename.includes('..')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filepath = path.join(UPLOAD_DIR, filename);

    try {
        if (!fs.existsSync(filepath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        fs.unlinkSync(filepath);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
