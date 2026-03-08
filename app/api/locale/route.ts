import { NextRequest, NextResponse } from 'next/server';
import { LOCALE_COOKIE, isValidLocale } from '@/lib/locale';

export async function POST(req: NextRequest) {
    const { locale } = await req.json();
    if (!isValidLocale(locale))
        return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(LOCALE_COOKIE, locale, {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
    });
    return res;
}
