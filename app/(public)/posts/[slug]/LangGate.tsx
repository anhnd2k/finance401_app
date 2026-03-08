'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, LOCALE_LABELS, type Locale } from '@/lib/locale';
import { Globe, Home } from 'lucide-react';

interface Props {
    postLang: Locale;
    userLang: Locale;
}

export default function LangGate({ postLang, userLang }: Props) {
    const router = useRouter();
    const [switching, setSwitching] = useState(false);

    async function switchAndRead() {
        setSwitching(true);
        await fetch('/api/locale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: postLang }),
        });
        window.dispatchEvent(new CustomEvent('locale-change', { detail: postLang }));

        // Navigate to the correct locale-prefixed URL for the post's language
        const currentPath = window.location.pathname;
        const qs = window.location.search;
        if (postLang === 'en') {
            const newPath = currentPath.startsWith('/en') ? currentPath : '/en' + currentPath;
            router.push(newPath + qs);
        } else {
            const newPath = currentPath.startsWith('/en') ? currentPath.slice(3) || '/' : currentPath;
            router.push(newPath + qs);
        }
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="max-w-md text-center">
                <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                        <Globe className="h-10 w-10 text-blue-500" />
                    </div>
                </div>

                <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                    {userLang === 'vi'
                        ? 'Bài viết này không có sẵn bằng ngôn ngữ của bạn'
                        : 'This article is not available in your language'}
                </h2>

                <p className="mb-8 text-gray-500 dark:text-gray-400">
                    {userLang === 'vi'
                        ? `Bài viết này chỉ có sẵn bằng ${LOCALE_LABELS[postLang]}. Bạn có muốn chuyển sang ngôn ngữ đó không?`
                        : `This article is only available in ${LOCALE_LABELS[postLang]}. Would you like to switch to that language?`}
                </p>

                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <button
                        onClick={switchAndRead}
                        disabled={switching}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        <Globe className="h-4 w-4" />
                        {switching
                            ? '…'
                            : userLang === 'vi'
                              ? `Đọc bằng ${LOCALE_LABELS[postLang]}`
                              : `Read in ${LOCALE_LABELS[postLang]}`}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    >
                        {userLang === 'vi' ? 'Quay lại' : 'Go back'}
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    >
                        <Home className="h-4 w-4" />
                        {userLang === 'vi' ? 'Trang chủ' : 'Homepage'}
                    </button>
                </div>
            </div>
        </div>
    );
}
