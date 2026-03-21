import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || 'http://103.200.21.209';

function ensureUploadDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
}

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        ensureUploadDir();
        const files = fs.readdirSync(UPLOAD_DIR);
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];

        const images = files
            .filter((f) => imageExts.includes(path.extname(f).toLowerCase()))
            .map((filename) => {
                const filepath = path.join(UPLOAD_DIR, filename);
                const stat = fs.statSync(filepath);
                return {
                    filename,
                    url: `${UPLOAD_BASE_URL}/uploads/${filename}`,
                    size: stat.size,
                    createdAt: stat.birthtime.toISOString(),
                };
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ images });
    } catch {
        return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        ensureUploadDir();
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
        const ext = path.extname(file.name).toLowerCase();
        if (!imageExts.includes(ext)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        const MAX_SIZE = 5 * 1024 * 1024; // 5MB tối đa
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filename = `${Date.now()}_${safeName}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filepath, buffer);

        return NextResponse.json({
            filename,
            url: `${UPLOAD_BASE_URL}/uploads/${filename}`,
            size: file.size,
        });
    } catch {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
