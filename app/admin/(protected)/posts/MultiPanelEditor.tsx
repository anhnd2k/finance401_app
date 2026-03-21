'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Globe, X, Check } from 'lucide-react';
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

interface PanelState {
    saving: boolean;
    isEdit: boolean;
}

export default function MultiPanelEditor({ allVersions, defaultLang, baseData }: Props) {
    const router = useRouter();
    const [openLangs, setOpenLangs] = useState<Locale[]>([defaultLang as Locale]);
    const [panelStates, setPanelStates] = useState<Record<string, PanelState>>({});
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function showToast(msg: string) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(msg);
        toastTimer.current = setTimeout(() => setToast(null), 3000);
    }

    useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

    function togglePanel(lang: Locale) {
        if (openLangs.includes(lang)) {
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

    const isSingle = openLangs.length === 1;

    // Fixed action bar — portal to body so it's always on top of everything
    const fixedBar = createPortal(
        <>
            {/* Toast notification */}
            <div
                className={`fixed bottom-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 shadow-lg transition-all duration-300 dark:border-green-800 dark:bg-gray-900 ${
                    toast ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
                }`}
            >
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{toast}</span>
            </div>

            {/* Action bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900">
                {/* Cancel */}
                <button
                    type="button"
                    onClick={() => router.push('/admin/posts')}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>

                {/* Per-panel submit buttons */}
                {openLangs.map((lang) => {
                    const state = panelStates[lang];
                    const label = LOCALE_LABELS[lang];
                    return (
                        <button
                            key={lang}
                            type="submit"
                            form={`post-form-${lang}`}
                            disabled={state?.saving}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            {state?.saving
                                ? 'Saving…'
                                : isSingle
                                  ? state?.isEdit ? 'Update Post' : 'Create Post'
                                  : state?.isEdit ? `Update ${label}` : `Create ${label}`}
                        </button>
                    );
                })}
            </div>
        </>,
        document.body
    );

    return (
        <div>
            {/* Sticky language bar */}
            <div className="sticky top-0 z-20 mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 shadow-sm dark:border-blue-900/30 dark:bg-blue-900/10">
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
                {!isSingle && (
                    <span className="ml-auto text-xs text-gray-400">scroll horizontally →</span>
                )}
            </div>

            {/* Panels — extra bottom padding so content isn't hidden behind fixed bar */}
            <div className={`flex gap-6 overflow-x-auto pb-20 ${isSingle ? 'justify-center' : ''}`}>
                {openLangs.map((lang) => {
                    const panelData = getPanelData(lang);
                    const versionExists = allVersions.some((v) => v.language === lang);
                    return (
                        <div
                            key={`${lang}-${panelData.id ?? 'new'}`}
                            className={`min-w-[580px] flex-1 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${isSingle ? 'max-w-3xl' : ''}`}
                        >
                            {/* Panel header */}
                            <div className="flex items-center justify-between rounded-t-xl border-b border-gray-100 px-6 py-4 dark:border-gray-800">
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

                            <div className="p-6">
                                <PostForm
                                    initialData={panelData}
                                    lockedLanguage={lang}
                                    onSuccess={() => {
                                        showToast('Đã lưu thành công!');
                                    }}
                                    formId={`post-form-${lang}`}
                                    hideActions
                                    onSaveStateChange={(state) =>
                                        setPanelStates((prev) => ({ ...prev, [lang]: state }))
                                    }
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fixed action bar */}
            {fixedBar}
        </div>
    );
}
