import { headers } from 'next/headers';
import { DEFAULT_LOCALE, isValidLocale, type Locale } from './locale';

/**
 * Server-only: resolves the active locale from the middleware x-locale header
 * (set when visiting /en/... URLs). Defaults to Vietnamese otherwise.
 */
export async function getLocale(): Promise<Locale> {
    const headersList = await headers();
    const xLocale = headersList.get('x-locale');
    if (xLocale && isValidLocale(xLocale)) return xLocale;
    return DEFAULT_LOCALE;
}
