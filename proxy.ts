import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'f401_session';
const LOCALE_COOKIE = 'f401_lang';

async function verifySession(token: string): Promise<boolean> {
    try {
        const dot = token.lastIndexOf('.');
        if (dot === -1) return false;
        const payload = token.slice(0, dot);
        const sig = token.slice(dot + 1);
        const secret = process.env.AUTH_SECRET || 'finance401-secret';
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );
        const valid = await crypto.subtle.verify(
            'HMAC',
            key,
            Buffer.from(sig, 'base64url'),
            new TextEncoder().encode(payload)
        );
        if (!valid) return false;
        const data = JSON.parse(
            Buffer.from(payload, 'base64url').toString()
        );
        return data.exp > Date.now();
    } catch {
        return false;
    }
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const host = req.headers.get('host') || '';

    // Handle admin subdomain
    if (host.startsWith('admin.')) {
        if (!pathname.startsWith('/admin')) {
            const newPath = '/admin' + (pathname === '/' ? '' : pathname);
            return NextResponse.rewrite(new URL(newPath, req.url));
        }
        // Auth guard cho subdomain
        if (pathname !== '/admin/login') {
            const token = req.cookies.get(COOKIE_NAME)?.value;
            if (!token || !(await verifySession(token))) {
                return NextResponse.redirect(new URL('/login', req.url));
            }
        }
        return NextResponse.next();
    }

    // Handle /en locale prefix
    if (pathname === '/en' || pathname.startsWith('/en/')) {
        const newPath = pathname === '/en' ? '/' : pathname.slice(3);
        const newHeaders = new Headers(req.headers);
        newHeaders.set('x-locale', 'en');
        const response = NextResponse.rewrite(new URL(newPath || '/', req.url), {
            request: { headers: newHeaders },
        });
        response.cookies.set(LOCALE_COOKIE, 'en', {
            path: '/',
            maxAge: 365 * 24 * 60 * 60,
            sameSite: 'lax',
        });
        return response;
    }

    // Admin auth guard (truy cập qua runtocoast.com/admin)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const token = req.cookies.get(COOKIE_NAME)?.value;
        if (!token || !(await verifySession(token))) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/en', '/en/:path*', '/'],
};