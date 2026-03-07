import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'f401_session';

export interface SessionData {
    userId: number;
    username: string;
    role: string;
    exp: number;
}

async function getHmacKey(usage: KeyUsage[]): Promise<CryptoKey> {
    const secret = process.env.AUTH_SECRET || 'finance401-secret';
    return crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        usage
    );
}

export async function signToken(data: SessionData): Promise<string> {
    const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
    const key = await getHmacKey(['sign']);
    const sigBuf = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(payload)
    );
    const sig = Buffer.from(sigBuf).toString('base64url');
    return `${payload}.${sig}`;
}

export async function verifyToken(
    token: string
): Promise<SessionData | null> {
    try {
        const dot = token.lastIndexOf('.');
        if (dot === -1) return null;
        const payload = token.slice(0, dot);
        const sig = token.slice(dot + 1);
        const key = await getHmacKey(['verify']);
        const valid = await crypto.subtle.verify(
            'HMAC',
            key,
            Buffer.from(sig, 'base64url'),
            new TextEncoder().encode(payload)
        );
        if (!valid) return null;
        const data = JSON.parse(
            Buffer.from(payload, 'base64url').toString()
        ) as SessionData;
        if (data.exp < Date.now()) return null;
        return data;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function requireAuth(): Promise<SessionData> {
    const session = await getSession();
    if (!session) redirect('/admin/login');
    return session;
}

export async function createSessionToken(
    userId: number,
    username: string,
    role: string
): Promise<string> {
    return signToken({
        userId,
        username,
        role,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
}

export { COOKIE_NAME };
