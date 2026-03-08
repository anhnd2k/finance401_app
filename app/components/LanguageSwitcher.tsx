'use client';

import {
    LOCALES,
    LOCALE_SHORT,
    type Locale,
} from '@/lib/locale';

interface Props {
    pathname: string;
}

export default function LanguageSwitcher({
    pathname,
}: Props) {
    const active: Locale = pathname.startsWith(
        '/en'
    )
        ? 'en'
        : 'vi';

    function getUrl(lang: Locale): string {
        return lang === 'en' ? '/en' : '/';
    }

    return (
        <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {LOCALES.map((lang) => {
                const isActive = lang === active;
                return (
                    <a
                        key={lang}
                        href={getUrl(lang)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                            isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                    >
                        {LOCALE_SHORT[lang]}
                    </a>
                );
            })}
        </div>
    );
}
