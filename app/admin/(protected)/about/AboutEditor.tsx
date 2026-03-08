'use client';

import { useState, useEffect } from 'react';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/lib/locale';
import { Globe } from 'lucide-react';

interface PanelState {
    content: string;
    saving: boolean;
    saved: boolean;
    error: string;
    loaded: boolean;
}

const EMPTY: PanelState = { content: '', saving: false, saved: false, error: '', loaded: false };

export default function AboutEditor() {
    const [openLangs, setOpenLangs] = useState<Locale[]>(['vi']);
    const [panels, setPanels] = useState<Record<Locale, PanelState>>({
        vi: { ...EMPTY },
        en: { ...EMPTY },
    });
    const [previewLang, setPreviewLang] = useState<Locale | null>(null);

    useEffect(() => {
        LOCALES.forEach((lang) => {
            fetch(`/api/admin/pages?key=about&language=${lang}`)
                .then((r) => r.json())
                .then((data) => {
                    setPanels((prev) => ({
                        ...prev,
                        [lang]: { ...EMPTY, content: data.content ?? '', loaded: true },
                    }));
                })
                .catch(() => {
                    setPanels((prev) => ({
                        ...prev,
                        [lang]: { ...EMPTY, loaded: true },
                    }));
                });
        });
    }, []);

    function togglePanel(lang: Locale) {
        if (openLangs.includes(lang)) {
            if (openLangs.length > 1) setOpenLangs((p) => p.filter((l) => l !== lang));
        } else {
            setOpenLangs((p) => [...p, lang]);
        }
    }

    function setContent(lang: Locale, value: string) {
        setPanels((prev) => ({
            ...prev,
            [lang]: { ...prev[lang], content: value, saved: false },
        }));
    }

    async function save(lang: Locale) {
        setPanels((prev) => ({ ...prev, [lang]: { ...prev[lang], saving: true, error: '' } }));
        try {
            const res = await fetch('/api/admin/pages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'about', language: lang, content: panels[lang].content }),
            });
            if (res.ok) {
                setPanels((prev) => ({ ...prev, [lang]: { ...prev[lang], saving: false, saved: true } }));
            } else {
                const data = await res.json();
                setPanels((prev) => ({ ...prev, [lang]: { ...prev[lang], saving: false, error: data.error ?? 'Failed to save' } }));
            }
        } catch {
            setPanels((prev) => ({ ...prev, [lang]: { ...prev[lang], saving: false, error: 'Network error' } }));
        }
    }

    const inputClass = 'w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white';

    return (
        <div>
            {/* Language selector */}
            <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <Globe className="h-4 w-4 shrink-0 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    Language Versions:
                </span>
                {LOCALES.map((loc) => {
                    const isOpen = openLangs.includes(loc);
                    const hasContent = !!panels[loc].content;
                    return (
                        <button
                            key={loc}
                            onClick={() => togglePanel(loc)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                isOpen
                                    ? 'bg-blue-600 text-white'
                                    : hasContent
                                      ? 'border border-blue-200 bg-white text-blue-700 hover:border-blue-400 dark:border-blue-800 dark:bg-gray-900 dark:text-blue-400'
                                      : 'border border-dashed border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400'
                            }`}
                        >
                            {LOCALE_LABELS[loc]}
                        </button>
                    );
                })}
                {openLangs.length > 1 && (
                    <span className="ml-auto text-xs text-gray-400">scroll horizontally →</span>
                )}
            </div>

            {/* Panels */}
            <div className="flex gap-6 overflow-x-auto pb-4">
                {openLangs.map((lang) => {
                    const panel = panels[lang];
                    const isPreview = previewLang === lang;
                    return (
                        <div
                            key={lang}
                            className="min-w-[580px] max-w-3xl flex-1 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                        >
                            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                                <span className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                                    {LOCALE_LABELS[lang]}
                                </span>
                                <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewLang(null)}
                                        className={`px-3 py-1.5 font-medium transition-colors ${!isPreview ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400'}`}
                                    >
                                        Write
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewLang(lang)}
                                        className={`px-3 py-1.5 font-medium transition-colors ${isPreview ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400'}`}
                                    >
                                        Preview
                                    </button>
                                </div>
                            </div>

                            {panel.error && (
                                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    {panel.error}
                                </div>
                            )}
                            {panel.saved && (
                                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Saved successfully.
                                </div>
                            )}

                            {isPreview ? (
                                <div
                                    className="prose prose-sm max-w-none min-h-[400px] rounded-lg border border-gray-300 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
                                    dangerouslySetInnerHTML={{
                                        __html: panel.content || '<p class="text-gray-400">Nothing to preview yet…</p>',
                                    }}
                                />
                            ) : (
                                <textarea
                                    value={panel.content}
                                    onChange={(e) => setContent(lang, e.target.value)}
                                    rows={20}
                                    className={`${inputClass} font-mono text-xs`}
                                    placeholder="<p>About page content (HTML)…</p>"
                                />
                            )}

                            <button
                                type="button"
                                onClick={() => save(lang)}
                                disabled={panel.saving}
                                className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                            >
                                {panel.saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
