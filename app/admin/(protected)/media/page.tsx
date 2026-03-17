import { requireAuth } from '@/lib/auth';
import MediaClient from './MediaClient';
import fs from 'fs';
import path from 'path';

export const metadata = { title: 'Media — Admin' };

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || 'http://103.200.21.209';

function getImages() {
    try {
        if (!fs.existsSync(UPLOAD_DIR)) return [];
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
        return fs
            .readdirSync(UPLOAD_DIR)
            .filter((f) => imageExts.includes(path.extname(f).toLowerCase()))
            .map((filename) => {
                const stat = fs.statSync(path.join(UPLOAD_DIR, filename));
                return {
                    filename,
                    url: `${UPLOAD_BASE_URL}/uploads/${filename}`,
                    size: stat.size,
                    createdAt: stat.birthtime.toISOString(),
                };
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
        return [];
    }
}

export default async function MediaPage() {
    await requireAuth();
    const images = getImages();
    return <MediaClient initialImages={images} />;
}
