export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'vi';
export const LOCALE_COOKIE = 'f401_lang';

export const LOCALE_LABELS: Record<Locale, string> = {
    vi: 'Tiếng Việt',
    en: 'English',
};

export const LOCALE_SHORT: Record<Locale, string> = {
    vi: 'VI',
    en: 'EN',
};

export function isValidLocale(v: unknown): v is Locale {
    return LOCALES.includes(v as Locale);
}

export function localePath(path: string, locale: Locale): string {
    return locale === 'en' ? '/en' + path : path;
}
