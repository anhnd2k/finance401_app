'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';

interface PostFormData {
    id?: number;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    status?: string;
    categoryName?: string;
    tags?: string;
    images?: string;
}

export default function PostForm({ initialData }: { initialData?: PostFormData }) {
    const router = useRouter();
    const isEdit = !!initialData?.id;

    const [title, setTitle] = useState(initialData?.title ?? '');
    const [slug, setSlug] = useState(initialData?.slug ?? '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
    const [content, setContent] = useState(initialData?.content ?? '');
    const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? '');
    const [status, setStatus] = useState(initialData?.status ?? 'DRAFT');
    const [categoryName, setCategoryName] = useState(
        initialData?.categoryName ?? ''
    );
    const [tags, setTags] = useState(initialData?.tags ?? '');
    const [images, setImages] = useState(initialData?.images ?? '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    function handleTitleChange(val: string) {
        setTitle(val);
        if (!isEdit || !initialData?.slug) {
            setSlug(slugify(val));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSaving(true);

        const tagList = tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
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
            categoryName,
            tags: tagList,
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
                router.push('/admin/posts');
                router.refresh();
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
    const labelClass =
        'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            {error && (
                <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {error}
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

            <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>Category</label>
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Investing"
                    />
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

            <div className="mb-5">
                <label className={labelClass}>Tags</label>
                <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={inputClass}
                    placeholder="comma-separated: stocks, bonds, ETF"
                />
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
                <label className={labelClass}>
                    Content (HTML) <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={16}
                    required
                    className={`${inputClass} font-mono text-xs`}
                    placeholder="<p>Your content here…</p>"
                />
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
                            ((e.target as HTMLImageElement).style.display =
                                'none')
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
                <button
                    type="button"
                    onClick={() => router.push('/admin/posts')}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
