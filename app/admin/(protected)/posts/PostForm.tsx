'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { X } from 'lucide-react';
import { LOCALE_LABELS } from '@/lib/locale';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Tag {
    id: number;
    name: string;
    slug: string;
}

export interface PostFormData {
    id?: number;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    status?: string;
    language?: string;
    translationGroupId?: number | null;
    categoryId?: number | null;
    tagNames?: string[];
    images?: string;
}

interface Props {
    initialData?: PostFormData;
    /** Lock the language field to this value (shown but not editable). Used in multi-panel editor. */
    lockedLanguage?: string;
    /** Called after a successful save instead of navigating away. Receives the saved post id. */
    onSuccess?: (savedId: number) => void;
}

export default function PostForm({ initialData, lockedLanguage, onSuccess }: Props) {
    const router = useRouter();
    const isEdit = !!initialData?.id;

    const [title, setTitle] = useState(initialData?.title ?? '');
    const [slug, setSlug] = useState(initialData?.slug ?? '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
    const [content, setContent] = useState(initialData?.content ?? '');
    const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? '');
    const [status, setStatus] = useState(initialData?.status ?? 'DRAFT');
    const [language, setLanguage] = useState(
        lockedLanguage ?? initialData?.language ?? 'vi'
    );
    const translationGroupId = initialData?.translationGroupId ?? null;
    const [categoryId, setCategoryId] = useState<number | ''>(
        initialData?.categoryId ?? ''
    );
    const [tagInput, setTagInput] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>(
        initialData?.tagNames ?? []
    );
    const [images, setImages] = useState(initialData?.images ?? '');

    const [categories, setCategories] = useState<Category[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [error, setError] = useState('');
    const [dupError, setDupError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const tagInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/admin/categories')
            .then((r) => r.json())
            .then(setCategories)
            .catch(() => {});
        fetch('/api/admin/tags')
            .then((r) => r.json())
            .then(setAllTags)
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!tagInput.trim()) {
            setTagSuggestions([]);
            return;
        }
        const q = tagInput.toLowerCase();
        setTagSuggestions(
            allTags
                .filter(
                    (t) =>
                        t.name.toLowerCase().includes(q) &&
                        !selectedTags.includes(t.name)
                )
                .slice(0, 5)
        );
    }, [tagInput, allTags, selectedTags]);

    function handleTitleChange(val: string) {
        setTitle(val);
        if (!isEdit) setSlug(slugify(val));
    }

    function addTag(name: string) {
        const trimmed = name.trim();
        if (!trimmed || selectedTags.includes(trimmed)) return;
        setSelectedTags((prev) => [...prev, trimmed]);
        setTagInput('');
        setTagSuggestions([]);
    }

    function removeTag(name: string) {
        setSelectedTags((prev) => prev.filter((t) => t !== name));
    }

    function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(tagInput);
        } else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSaving(true);
        setSaved(false);

        const imageList = images
            .split('\n')
            .map((u) => u.trim())
            .filter(Boolean);

        const body = {
            title,
            slug,
            excerpt,
            content,
            thumbnail,
            status,
            language: lockedLanguage ?? language,
            translationGroupId,
            categoryId: categoryId !== '' ? categoryId : null,
            tags: selectedTags,
            images: imageList,
        };

        try {
            const url = isEdit
                ? `/api/admin/posts/${initialData!.id}`
                : '/api/admin/posts';
            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                if (onSuccess) {
                    setSaved(true);
                    onSuccess(data.id);
                } else {
                    router.push('/admin/posts');
                    router.refresh();
                }
            } else if (res.status === 409) {
                setDupError(true);
            } else {
                const data = await res.json();
                setError(data.error ?? 'Failed to save post');
            }
        } catch {
            setError('Network error, please try again');
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        'w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white';
    const inputReadOnly =
        'w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400';
    const labelClass =
        'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            {/* Duplicate slug error modal */}
            {dupError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="mx-4 max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
                            Duplicate Slug
                        </h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            A post with the slug <strong>{slug}</strong> already exists in this language. Please choose a different slug.
                        </p>
                        <button
                            type="button"
                            onClick={() => setDupError(false)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                </div>
            )}
            {saved && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Saved successfully.
                </div>
            )}

            <div className="mb-5">
                <label className={labelClass}>
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    className={inputClass}
                />
            </div>

            <div className="mb-5">
                <label className={labelClass}>Slug</label>
                <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className={inputClass}
                    placeholder="auto-generated from title"
                />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                    <label className={labelClass}>Category</label>
                    <select
                        value={categoryId}
                        onChange={(e) =>
                            setCategoryId(
                                e.target.value === '' ? '' : parseInt(e.target.value)
                            )
                        }
                        className={inputClass}
                    >
                        <option value="">— No category —</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>
                        Language <span className="text-red-500">*</span>
                    </label>
                    {lockedLanguage ? (
                        <div className={inputReadOnly}>
                            {LOCALE_LABELS[lockedLanguage as keyof typeof LOCALE_LABELS] ??
                                lockedLanguage}
                        </div>
                    ) : (
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className={inputClass}
                        >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                        </select>
                    )}
                </div>
                <div>
                    <label className={labelClass}>Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={inputClass}
                    >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                    </select>
                </div>
            </div>

            {/* Tags chip input */}
            <div className="mb-5">
                <label className={labelClass}>Tags</label>
                <div
                    className="flex min-h-[42px] flex-wrap gap-1.5 cursor-text rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800"
                    onClick={() => tagInputRef.current?.focus()}
                >
                    {selectedTags.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeTag(tag);
                                }}
                                className="hover:text-blue-900 dark:hover:text-blue-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        ref={tagInputRef}
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder={
                            selectedTags.length === 0
                                ? 'Type a tag and press Enter…'
                                : ''
                        }
                        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none dark:text-white placeholder:text-gray-400"
                    />
                </div>
                {tagSuggestions.length > 0 && (
                    <div className="mt-1 rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                        {tagSuggestions.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => addTag(t.name)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                )}
                <p className="mt-1 text-xs text-gray-400">Press Enter to add a tag</p>
            </div>

            <div className="mb-5">
                <label className={labelClass}>Excerpt</label>
                <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={2}
                    className={inputClass}
                    placeholder="Short description shown on post cards"
                />
            </div>

            <div className="mb-5">
                <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Content (HTML) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setPreviewMode(false)}
                            className={`px-3 py-1.5 font-medium transition-colors ${!previewMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                        >
                            Write
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreviewMode(true)}
                            className={`px-3 py-1.5 font-medium transition-colors ${previewMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                        >
                            Preview
                        </button>
                    </div>
                </div>
                {previewMode ? (
                    <div
                        className="prose prose-sm max-w-none min-h-[400px] rounded-lg border border-gray-300 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{
                            __html:
                                content ||
                                '<p class="text-gray-400">Nothing to preview yet…</p>',
                        }}
                    />
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={16}
                        required
                        className={`${inputClass} font-mono text-xs`}
                        placeholder="<p>Your content here…</p>"
                    />
                )}
            </div>

            <div className="mb-5">
                <label className={labelClass}>Thumbnail URL</label>
                <input
                    type="url"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className={inputClass}
                    placeholder="https://example.com/image.jpg"
                />
                {thumbnail && (
                    <img
                        src={thumbnail}
                        alt="thumbnail preview"
                        className="mt-2 h-24 rounded-lg object-cover"
                        onError={(e) =>
                            ((e.target as HTMLImageElement).style.display = 'none')
                        }
                    />
                )}
            </div>

            <div className="mb-8">
                <label className={labelClass}>Additional Image URLs</label>
                <textarea
                    value={images}
                    onChange={(e) => setImages(e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="One URL per line"
                />
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    {saving ? 'Saving…' : isEdit ? 'Update Post' : 'Create Post'}
                </button>
                {!onSuccess && (
                    <button
                        type="button"
                        onClick={() => router.push('/admin/posts')}
                        className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
