'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, X } from 'lucide-react';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/lib/locale';
import PostForm, { type PostFormData } from './PostForm';

export interface PanelVersion {
    id: number;
    language: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail: string;
    status: string;
    categoryId: number | null;
    tagNames: string[];
    images: string;
    translationGroupId: number | null;
}

interface Props {
    allVersions: PanelVersion[];
    defaultLang: string;
    baseData: {
        slug: string;
        title: string;
        thumbnail: string;
        categoryId: number | null;
        tagNames: string[];
        images: string;
        translationGroupId: number;
    };
}

export default function MultiPanelEditor({ allVersions, defaultLang, baseData }: Props) {
    const router = useRouter();
    const [openLangs, setOpenLangs] = useState<Locale[]>([defaultLang as Locale]);

    function togglePanel(lang: Locale) {
        if (openLangs.includes(lang)) {
            // Close only if there's more than one panel open
            if (openLangs.length > 1) {
                setOpenLangs((prev) => prev.filter((l) => l !== lang));
            }
        } else {
            setOpenLangs((prev) => [...prev, lang]);
        }
    }

    function getPanelData(lang: Locale): PostFormData {
        const version = allVersions.find((v) => v.language === lang);
        if (version) {
            return {
                id: version.id,
                title: version.title,
                slug: version.slug,
                excerpt: version.excerpt,
                content: version.content,
                thumbnail: version.thumbnail,
                status: version.status,
                language: lang,
                categoryId: version.categoryId,
                tagNames: version.tagNames,
                images: version.images,
                translationGroupId: version.translationGroupId,
            };
        }
        // New version — pre-fill everything except content; slug is inherited (read-only)
        return {
            title: baseData.title,
            slug: baseData.slug,
            excerpt: '',
            content: '',
            thumbnail: baseData.thumbnail,
            status: 'DRAFT',
            language: lang,
            categoryId: baseData.categoryId,
            tagNames: baseData.tagNames,
            images: baseData.images,
            translationGroupId: baseData.translationGroupId,
        };
    }

    return (
        <div>
            {/* Language version selector */}
            <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <Globe className="h-4 w-4 shrink-0 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    Language Versions:
                </span>
                {LOCALES.map((loc) => {
                    const exists = allVersions.some((v) => v.language === loc);
                    const isOpen = openLangs.includes(loc);
                    return (
                        <button
                            key={loc}
                            onClick={() => togglePanel(loc)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                isOpen
                                    ? 'bg-blue-600 text-white'
                                    : exists
                                      ? 'border border-blue-200 bg-white text-blue-700 hover:border-blue-400 dark:border-blue-800 dark:bg-gray-900 dark:text-blue-400'
                                      : 'border border-dashed border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400'
                            }`}
                        >
                            {exists ? `Edit ${LOCALE_LABELS[loc]}` : `+ Add ${LOCALE_LABELS[loc]}`}
                        </button>
                    );
                })}
                {openLangs.length > 1 && (
                    <span className="ml-auto text-xs text-gray-400">
                        scroll horizontally →
                    </span>
                )}
            </div>

            {/* Panels — horizontal scroll, side by side */}
            <div className="flex gap-6 overflow-x-auto pb-4">
                {openLangs.map((lang) => {
                    const panelData = getPanelData(lang);
                    const versionExists = allVersions.some((v) => v.language === lang);
                    return (
                        <div
                            // Key changes when a "new" version is saved and gets an id → remounts PostForm
                            key={`${lang}-${panelData.id ?? 'new'}`}
                            className="min-w-[580px] max-w-3xl flex-1 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                        >
                            {/* Panel header */}
                            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                                        {LOCALE_LABELS[lang]}
                                    </span>
                                    {!versionExists && (
                                        <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                            New version
                                        </span>
                                    )}
                                </div>
                                {openLangs.length > 1 && (
                                    <button
                                        onClick={() => togglePanel(lang)}
                                        className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        title="Close panel"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <PostForm
                                initialData={panelData}
                                lockedLanguage={lang}
                                onSuccess={() => router.refresh()}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
