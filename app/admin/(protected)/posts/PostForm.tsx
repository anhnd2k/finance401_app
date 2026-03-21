'use client';

import {
    useState,
    useEffect,
    useRef,
    KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';
import {
    X,
    Check,
    AlertCircle,
    ImageIcon,
} from 'lucide-react';
import { LOCALE_LABELS } from '@/lib/locale';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
    () => import('./RichTextEditor'),
    { ssr: false }
);

const MediaPickerModal = dynamic(
    () => import('./MediaPickerModal'),
    { ssr: false }
);

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
    /** If set, adds this id to the <form> element so external buttons can submit via form= attribute. */
    formId?: string;
    /** Hide the built-in action buttons (submit/cancel) at the bottom. */
    hideActions?: boolean;
    /** Called whenever saving or isEdit state changes — lets parent render action buttons. */
    onSaveStateChange?: (state: {
        saving: boolean;
        isEdit: boolean;
    }) => void;
}

type AutoSaveStatus =
    | 'idle'
    | 'saving'
    | 'saved'
    | 'error';

function formatTime(d: Date) {
    return d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export default function PostForm({
    initialData,
    lockedLanguage,
    onSuccess,
    formId,
    hideActions,
    onSaveStateChange,
}: Props) {
    const router = useRouter();
    const translationGroupId =
        initialData?.translationGroupId ?? null;

    // postId tracks the saved id — updated after first auto-save of a new post
    const [postId, setPostId] = useState<
        number | undefined
    >(initialData?.id);
    const isEdit = !!postId;

    const [title, setTitle] = useState(
        initialData?.title ?? ''
    );
    const [slug, setSlug] = useState(
        initialData?.slug ?? ''
    );
    const [excerpt, setExcerpt] = useState(
        initialData?.excerpt ?? ''
    );
    const [content, setContent] = useState(
        initialData?.content ?? ''
    );
    const [thumbnail, setThumbnail] = useState(
        initialData?.thumbnail ?? ''
    );
    const [status, setStatus] = useState(
        initialData?.status ?? 'DRAFT'
    );
    const [language, setLanguage] = useState(
        lockedLanguage ??
            initialData?.language ??
            'vi'
    );
    const [categoryId, setCategoryId] = useState<
        number | ''
    >(initialData?.categoryId ?? '');
    const [tagInput, setTagInput] = useState('');
    const [selectedTags, setSelectedTags] =
        useState<string[]>(
            initialData?.tagNames ?? []
        );
    const [images, setImages] = useState(
        initialData?.images ?? ''
    );
    const [showThumbPicker, setShowThumbPicker] = useState(false);

    const [categories, setCategories] = useState<
        Category[]
    >([]);
    const [allTags, setAllTags] = useState<Tag[]>(
        []
    );
    const [tagSuggestions, setTagSuggestions] =
        useState<Tag[]>([]);
    const [error, setError] = useState('');
    const [dupError, setDupError] =
        useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const tagInputRef =
        useRef<HTMLInputElement>(null);

    // Auto-save state
    const [autoSaveStatus, setAutoSaveStatus] =
        useState<AutoSaveStatus>('idle');
    const [autoSavedAt, setAutoSavedAt] =
        useState<Date | null>(null);
    const isDirtyRef = useRef(false);
    const autoSaveTimerRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);
    const autoSaveHideTimerRef =
        useRef<ReturnType<
            typeof setTimeout
        > | null>(null);
    // Always-current snapshot of form state for use in event handlers / effects
    const formStateRef = useRef({
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        status,
        language,
        categoryId,
        selectedTags,
        images,
    });
    const postIdRef = useRef(postId);

    // Keep refs in sync
    useEffect(() => {
        formStateRef.current = {
            title,
            slug,
            excerpt,
            content,
            thumbnail,
            status,
            language,
            categoryId,
            selectedTags,
            images,
        };
    });
    useEffect(() => {
        postIdRef.current = postId;
    }, [postId]);

    // Notify parent of save state changes
    useEffect(() => {
        onSaveStateChange?.({ saving, isEdit });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saving, isEdit]);

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
                        t.name
                            .toLowerCase()
                            .includes(q) &&
                        !selectedTags.includes(
                            t.name
                        )
                )
                .slice(0, 5)
        );
    }, [tagInput, allTags, selectedTags]);

    // Save on page unload (tab close / refresh / browser navigation)
    useEffect(() => {
        function handleBeforeUnload() {
            if (
                !isDirtyRef.current ||
                !formStateRef.current.title.trim() ||
                formStateRef.current.status !==
                    'DRAFT'
            )
                return;
            const id = postIdRef.current;
            fetch(
                id
                    ? `/api/admin/posts/${id}`
                    : '/api/admin/posts',
                {
                    method: id ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify(
                        buildBodyFromRef('DRAFT')
                    ),
                    keepalive: true,
                }
            );
        }
        window.addEventListener(
            'beforeunload',
            handleBeforeUnload
        );
        return () =>
            window.removeEventListener(
                'beforeunload',
                handleBeforeUnload
            );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current)
                clearTimeout(
                    autoSaveTimerRef.current
                );
            if (autoSaveHideTimerRef.current)
                clearTimeout(
                    autoSaveHideTimerRef.current
                );
        };
    }, []);

    function buildBodyFromRef(
        overrideStatus?: string
    ) {
        const s = formStateRef.current;
        return {
            title: s.title,
            slug: s.slug,
            excerpt: s.excerpt,
            content: s.content,
            thumbnail: s.thumbnail,
            status: overrideStatus ?? s.status,
            language:
                lockedLanguage ?? s.language,
            translationGroupId,
            categoryId:
                s.categoryId !== ''
                    ? s.categoryId
                    : null,
            tags: s.selectedTags,
            images: s.images
                .split('\n')
                .map((u) => u.trim())
                .filter(Boolean),
        };
    }

    function markDirty() {
        isDirtyRef.current = true;
        // Only schedule auto-save for DRAFT posts
        if (
            formStateRef.current.status !==
            'DRAFT'
        )
            return;
        if (autoSaveTimerRef.current)
            clearTimeout(
                autoSaveTimerRef.current
            );
        autoSaveTimerRef.current = setTimeout(
            performAutoSave,
            3000
        );
    }

    async function performAutoSave() {
        if (
            formStateRef.current.status !==
            'DRAFT'
        )
            return;
        if (!formStateRef.current.title.trim())
            return;
        setAutoSaveStatus('saving');
        const id = postIdRef.current;
        try {
            const res = await fetch(
                id
                    ? `/api/admin/posts/${id}`
                    : '/api/admin/posts',
                {
                    method: id ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify(
                        buildBodyFromRef('DRAFT')
                    ),
                }
            );
            if (res.ok) {
                const data = await res.json();
                if (!id) setPostId(data.id);
                isDirtyRef.current = false;
                setAutoSavedAt(new Date());
                setAutoSaveStatus('saved');
                if (autoSaveHideTimerRef.current)
                    clearTimeout(
                        autoSaveHideTimerRef.current
                    );
                autoSaveHideTimerRef.current =
                    setTimeout(
                        () =>
                            setAutoSaveStatus(
                                'idle'
                            ),
                        4000
                    );
            } else {
                setAutoSaveStatus('error');
            }
        } catch {
            setAutoSaveStatus('error');
        }
    }

    function handleTitleChange(val: string) {
        setTitle(val);
        if (!isEdit) setSlug(slugify(val));
        markDirty();
    }

    function addTag(name: string) {
        const trimmed = name.trim();
        if (
            !trimmed ||
            selectedTags.includes(trimmed)
        )
            return;
        setSelectedTags((prev) => [
            ...prev,
            trimmed,
        ]);
        setTagInput('');
        setTagSuggestions([]);
        markDirty();
    }

    function removeTag(name: string) {
        setSelectedTags((prev) =>
            prev.filter((t) => t !== name)
        );
        markDirty();
    }

    function handleTagKeyDown(
        e: KeyboardEvent<HTMLInputElement>
    ) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(tagInput);
        } else if (
            e.key === 'Backspace' &&
            !tagInput &&
            selectedTags.length > 0
        ) {
            removeTag(
                selectedTags[
                    selectedTags.length - 1
                ]
            );
        }
    }

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();
        // Cancel any pending auto-save
        if (autoSaveTimerRef.current)
            clearTimeout(
                autoSaveTimerRef.current
            );
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
            categoryId:
                categoryId !== ''
                    ? categoryId
                    : null,
            tags: selectedTags,
            images: imageList,
        };

        try {
            const url = isEdit
                ? `/api/admin/posts/${postId}`
                : '/api/admin/posts';
            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                isDirtyRef.current = false;
                setPostId(data.id);
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
                setError(
                    data.error ??
                        'Failed to save post'
                );
            }
        } catch {
            setError(
                'Network error, please try again'
            );
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
        <form
            id={formId}
            onSubmit={handleSubmit}
            className="mx-auto max-w-3xl"
        >
            {/* Auto-save notification */}
            {autoSaveStatus !== 'idle' && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    {autoSaveStatus ===
                        'saving' && (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Auto-saving draft…
                            </span>
                        </>
                    )}
                    {autoSaveStatus ===
                        'saved' && (
                        <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Draft saved
                                {autoSavedAt
                                    ? ` at ${formatTime(autoSavedAt)}`
                                    : ''}
                            </span>
                        </>
                    )}
                    {autoSaveStatus ===
                        'error' && (
                        <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Auto-save failed
                            </span>
                        </>
                    )}
                </div>
            )}

            {/* Duplicate slug error modal */}
            {dupError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="mx-4 max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
                            Duplicate Slug
                        </h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            A post with the slug{' '}
                            <strong>
                                {slug}
                            </strong>{' '}
                            already exists in this
                            language. Please
                            choose a different
                            slug.
                        </p>
                        <button
                            type="button"
                            onClick={() =>
                                setDupError(false)
                            }
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
            {/* {saved && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Saved successfully.
                </div>
            )} */}

            <div className="mb-5">
                <label className={labelClass}>
                    Title{' '}
                    <span className="text-red-500">
                        *
                    </span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                        handleTitleChange(
                            e.target.value
                        )
                    }
                    required
                    className={inputClass}
                />
            </div>

            <div className="mb-5">
                <label className={labelClass}>
                    Slug
                </label>
                <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                        setSlug(e.target.value);
                        markDirty();
                    }}
                    className={inputClass}
                    placeholder="auto-generated from title"
                />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                    <label className={labelClass}>
                        Category
                    </label>
                    <select
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(
                                e.target.value ===
                                    ''
                                    ? ''
                                    : parseInt(
                                          e.target
                                              .value
                                      )
                            );
                            markDirty();
                        }}
                        className={inputClass}
                    >
                        <option value="">
                            — No category —
                        </option>
                        {categories.map((c) => (
                            <option
                                key={c.id}
                                value={c.id}
                            >
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>
                        Language{' '}
                        <span className="text-red-500">
                            *
                        </span>
                    </label>
                    {lockedLanguage ? (
                        <div
                            className={
                                inputReadOnly
                            }
                        >
                            {LOCALE_LABELS[
                                lockedLanguage as keyof typeof LOCALE_LABELS
                            ] ?? lockedLanguage}
                        </div>
                    ) : (
                        <select
                            value={language}
                            onChange={(e) => {
                                setLanguage(
                                    e.target.value
                                );
                                markDirty();
                            }}
                            className={inputClass}
                        >
                            <option value="vi">
                                Tiếng Việt
                            </option>
                            <option value="en">
                                English
                            </option>
                        </select>
                    )}
                </div>
                <div>
                    <label className={labelClass}>
                        Status
                    </label>
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(
                                e.target.value
                            );
                            markDirty();
                        }}
                        className={inputClass}
                    >
                        <option value="DRAFT">
                            Draft
                        </option>
                        <option value="PUBLISHED">
                            Published
                        </option>
                    </select>
                </div>
            </div>

            {/* Tags chip input */}
            <div className="mb-5">
                <label className={labelClass}>
                    Tags
                </label>
                <div
                    className="flex min-h-[42px] cursor-text flex-wrap gap-1.5 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800"
                    onClick={() =>
                        tagInputRef.current?.focus()
                    }
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
                                    removeTag(
                                        tag
                                    );
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
                        onChange={(e) =>
                            setTagInput(
                                e.target.value
                            )
                        }
                        onKeyDown={
                            handleTagKeyDown
                        }
                        placeholder={
                            selectedTags.length ===
                            0
                                ? 'Type a tag and press Enter…'
                                : ''
                        }
                        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white"
                    />
                </div>
                {tagSuggestions.length > 0 && (
                    <div className="mt-1 rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                        {tagSuggestions.map(
                            (t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() =>
                                        addTag(
                                            t.name
                                        )
                                    }
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    {t.name}
                                </button>
                            )
                        )}
                    </div>
                )}
                <p className="mt-1 text-xs text-gray-400">
                    Press Enter to add a tag
                </p>
            </div>

            <div className="mb-5">
                <label className={labelClass}>
                    Excerpt
                </label>
                <textarea
                    value={excerpt}
                    onChange={(e) => {
                        setExcerpt(
                            e.target.value
                        );
                        markDirty();
                    }}
                    rows={2}
                    className={inputClass}
                    placeholder="Short description shown on post cards"
                />
            </div>

            <div className="mb-5">
                <label className={labelClass}>
                    Content{' '}
                    <span className="text-red-500">
                        *
                    </span>
                </label>
                <RichTextEditor
                    value={content}
                    onChange={(html) => {
                        setContent(html);
                        markDirty();
                    }}
                />
            </div>

            <div className="mb-5">
                <label className={labelClass}>
                    Thumbnail
                </label>
                {thumbnail ? (
                    <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={thumbnail}
                            alt="thumbnail"
                            className="h-36 w-auto rounded-lg object-cover shadow"
                            onError={(e) =>
                                ((e.target as HTMLImageElement).style.display = 'none')
                            }
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                            <button
                                type="button"
                                onClick={() => setShowThumbPicker(true)}
                                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-white"
                            >
                                Change
                            </button>
                            <button
                                type="button"
                                onClick={() => { setThumbnail(''); markDirty(); }}
                                className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowThumbPicker(true)}
                        className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
                    >
                        <ImageIcon className="h-5 w-5" />
                        Chọn ảnh thumbnail
                    </button>
                )}
            </div>

            {showThumbPicker && (
                <MediaPickerModal
                    onInsert={(url) => {
                        setThumbnail(url);
                        markDirty();
                        setShowThumbPicker(false);
                    }}
                    onClose={() => setShowThumbPicker(false)}
                />
            )}

            {/* <div className="mb-8">
                <label className={labelClass}>
                    Additional Image URLs
                </label>
                <textarea
                    value={images}
                    onChange={(e) => {
                        setImages(e.target.value);
                        markDirty();
                    }}
                    rows={3}
                    className={inputClass}
                    placeholder="One URL per line"
                />
            </div> */}

            {!hideActions && (
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving
                            ? 'Saving…'
                            : isEdit
                              ? 'Update Post'
                              : 'Create Post'}
                    </button>
                    {!onSuccess && (
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    '/admin/posts'
                                )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </form>
    );
}
