'use client';

import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Copy, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';

interface ImageItem {
    filename: string;
    url: string;
    size: number;
    createdAt: string;
}

interface Props {
    initialImages: ImageItem[];
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaClient({ initialImages }: Props) {
    const [images, setImages] = useState<ImageItem[]>(initialImages);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string[]>([]);
    const [preview, setPreview] = useState<ImageItem | null>(null);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function uploadFiles(files: FileList | File[]) {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;

        setUploading(true);
        setUploadProgress([]);
        const newImages: ImageItem[] = [];
        const errors: string[] = [];

        for (const file of fileArray) {
            const form = new FormData();
            form.append('file', file);
            try {
                const res = await fetch('/api/admin/uploads', { method: 'POST', body: form });
                const data = await res.json();
                if (!res.ok) {
                    errors.push(`${file.name}: ${data.error}`);
                } else {
                    newImages.push({ ...data, createdAt: new Date().toISOString() });
                }
            } catch {
                errors.push(`${file.name}: Upload failed`);
            }
        }

        setImages((prev) => [...newImages, ...prev]);
        setUploadProgress(errors);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleDelete(filename: string) {
        const res = await fetch(`/api/admin/uploads/${encodeURIComponent(filename)}`, { method: 'DELETE' });
        if (res.ok) {
            setImages((prev) => prev.filter((img) => img.filename !== filename));
            if (preview?.filename === filename) setPreview(null);
        }
        setDeleteConfirm(null);
    }

    async function copyUrl(url: string) {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // Fallback for non-HTTPS contexts
            const el = document.createElement('textarea');
            el.value = url;
            el.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    }

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Media</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{images.length} ảnh đã tải lên</p>
                </div>
            </div>

            {/* Upload zone */}
            <div
                className={`relative rounded-xl border-2 border-dashed transition-colors ${
                    dragOver
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                    disabled={uploading}
                />
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Upload className={`h-8 w-8 ${uploading ? 'animate-bounce text-blue-500' : 'text-gray-400'}`} />
                    {uploading ? (
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Đang tải lên...</p>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Kéo thả ảnh vào đây hoặc <span className="text-blue-600">chọn file</span>
                            </p>
                            <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF, SVG · Tối đa 10MB mỗi file</p>
                        </>
                    )}
                </div>
            </div>

            {/* Upload errors */}
            {uploadProgress.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                    {uploadProgress.map((msg, i) => (
                        <p key={i} className="text-sm text-red-600 dark:text-red-400">{msg}</p>
                    ))}
                </div>
            )}

            {/* Image grid */}
            {images.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
                    <ImageIcon className="h-12 w-12" />
                    <p className="text-sm">Chưa có ảnh nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {images.map((img) => (
                        <div
                            key={img.filename}
                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                            onClick={() => setPreview(img)}
                        >
                            {/* Thumbnail */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img.url}
                                alt={img.filename}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                loading="lazy"
                            />

                            {/* Hover overlay — pointer-events-none so clicks pass through to parent */}
                            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-black/0 p-1.5 transition-all group-hover:bg-black/40">
                                <div className="pointer-events-auto flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyUrl(img.url); }}
                                        className="rounded-md bg-white/90 p-1.5 text-gray-700 shadow hover:bg-white"
                                        title="Copy URL"
                                    >
                                        {copiedUrl === img.url ? (
                                            <Check className="h-3.5 w-3.5 text-green-600" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(img.filename); }}
                                        className="rounded-md bg-white/90 p-1.5 text-red-600 shadow hover:bg-white"
                                        title="Xóa"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <p className="truncate rounded bg-black/50 px-1 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    {formatSize(img.size)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview modal — portal to body so fixed covers full viewport */}
            {preview && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPreview(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreview(null)}
                            className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview.url}
                            alt={preview.filename}
                            className="max-h-[70vh] w-full object-contain"
                        />
                        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                            <p className="mb-1 truncate text-sm font-medium text-gray-900 dark:text-white">
                                {preview.filename}
                            </p>
                            <p className="mb-3 text-xs text-gray-400">
                                {formatSize(preview.size)} · {new Date(preview.createdAt).toLocaleString('vi-VN')}
                            </p>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={preview.url}
                                    className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                                <button
                                    onClick={() => copyUrl(preview.url)}
                                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                                >
                                    {copiedUrl === preview.url ? (
                                        <><Check className="h-3.5 w-3.5" /> Đã copy</>
                                    ) : (
                                        <><Copy className="h-3.5 w-3.5" /> Copy URL</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete confirm dialog — portal to body */}
            {deleteConfirm && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setDeleteConfirm(null)}
                >
                    <div
                        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Xóa ảnh?</h3>
                        <p className="mb-4 break-all text-sm text-gray-500 dark:text-gray-400">{deleteConfirm}</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
