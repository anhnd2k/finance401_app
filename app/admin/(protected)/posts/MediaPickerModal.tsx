'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Upload, AlignLeft, AlignCenter, AlignRight, Scissors, Check, Image as ImageIcon } from 'lucide-react';

type Align = 'left' | 'center' | 'right';

interface ImageItem {
    filename: string;
    url: string;
    size: number;
    createdAt: string;
}

interface Props {
    onInsert: (url: string, align: Align) => void;
    onClose: () => void;
    /** Pre-select the image matching this URL */
    initialUrl?: string;
}

function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getCroppedBlob(img: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
        img,
        crop.x * scaleX, crop.y * scaleY,
        crop.width * scaleX, crop.height * scaleY,
        0, 0, canvas.width, canvas.height
    );
    return new Promise((resolve, reject) =>
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('empty')), 'image/jpeg', 0.92)
    );
}

export default function MediaPickerModal({ onInsert, onClose, initialUrl }: Props) {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [selected, setSelected] = useState<ImageItem | null>(null);
    const [align, setAlign] = useState<Align>('center');
    const [cropMode, setCropMode] = useState(false);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [uploading, setUploading] = useState(false);
    const [inserting, setInserting] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/admin/uploads')
            .then(r => r.json())
            .then(d => {
                const list: ImageItem[] = d.images ?? [];
                setImages(list);
                if (initialUrl) {
                    const match = list.find(img => img.url === initialUrl);
                    if (match) setSelected(match);
                }
            })
            .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function uploadFiles(files: File[]) {
        if (!files.length) return;
        setUploading(true);
        for (const file of files) {
            const form = new FormData();
            form.append('file', file);
            const res = await fetch('/api/admin/uploads', { method: 'POST', body: form });
            if (res.ok) {
                const data = await res.json();
                const item: ImageItem = { ...data, createdAt: new Date().toISOString() };
                setImages(prev => [item, ...prev]);
                setSelected(item);
            }
        }
        setUploading(false);
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const c = centerCrop(
            makeAspectCrop({ unit: '%', width: 80 }, width / height, width, height),
            width, height
        );
        setCrop(c);
    }

    async function handleInsert() {
        if (!selected) return;
        setInserting(true);
        let url = selected.url;

        if (cropMode && completedCrop && imgRef.current) {
            try {
                const blob = await getCroppedBlob(imgRef.current, completedCrop);
                const ext = selected.filename.split('.').pop() ?? 'jpg';
                const form = new FormData();
                form.append('file', new File([blob], `cropped_${Date.now()}.${ext}`, { type: blob.type }));
                const res = await fetch('/api/admin/uploads', { method: 'POST', body: form });
                if (res.ok) {
                    const data = await res.json();
                    url = data.url;
                }
            } catch { /* use original */ }
        }

        onInsert(url, align);
        setInserting(false);
    }

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length) uploadFiles(files);
    }, []);

    const modal = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Chèn hình ảnh</h2>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex min-h-0 flex-1">
                    {/* Left — gallery */}
                    <div className="flex w-full flex-col border-r border-gray-200 dark:border-gray-800 md:w-[55%]">
                        {/* Upload zone */}
                        <div
                            className={`relative m-3 shrink-0 rounded-xl border-2 border-dashed transition-colors ${dragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}`}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={onDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                onChange={e => e.target.files && uploadFiles(Array.from(e.target.files))}
                                disabled={uploading}
                            />
                            <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-400">
                                <Upload className={`h-4 w-4 ${uploading ? 'animate-bounce text-blue-500' : ''}`} />
                                {uploading ? 'Đang tải lên…' : 'Kéo thả hoặc click để tải ảnh'}
                            </div>
                        </div>

                        {/* Image grid */}
                        <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto p-3 content-start">
                            {images.length === 0 && !uploading && (
                                <div className="col-span-3 flex flex-col items-center gap-2 py-12 text-gray-400">
                                    <ImageIcon className="h-8 w-8" />
                                    <p className="text-sm">Chưa có ảnh nào</p>
                                </div>
                            )}
                            {images.map(img => (
                                <button
                                    key={img.filename}
                                    onClick={() => { setSelected(img); setCropMode(false); setCompletedCrop(undefined); }}
                                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${selected?.filename === img.filename ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img.url} alt={img.filename} className="h-full w-full object-cover" loading="lazy" />
                                    {selected?.filename === img.filename && (
                                        <div className="absolute right-1.5 top-1.5 rounded-full bg-blue-500 p-0.5">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right — preview + options */}
                    <div className="hidden flex-col md:flex md:w-[45%]">
                        {!selected ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400">
                                <ImageIcon className="h-10 w-10" />
                                <p className="text-sm">Chọn ảnh để xem trước</p>
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col overflow-hidden">
                                {/* Preview / Crop area */}
                                <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-50 p-4 dark:bg-gray-800/50">
                                    {cropMode ? (
                                        <ReactCrop
                                            crop={crop}
                                            onChange={c => setCrop(c)}
                                            onComplete={c => setCompletedCrop(c)}
                                            className="max-h-full max-w-full"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                ref={imgRef}
                                                src={selected.url}
                                                alt={selected.filename}
                                                onLoad={onImageLoad}
                                                className="max-h-[40vh] max-w-full object-contain"
                                            />
                                        </ReactCrop>
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={selected.url}
                                            alt={selected.filename}
                                            className="max-h-[40vh] max-w-full rounded-lg object-contain shadow"
                                        />
                                    )}
                                </div>

                                {/* Options */}
                                <div className="shrink-0 border-t border-gray-200 p-4 dark:border-gray-800">
                                    <p className="mb-3 truncate text-xs text-gray-400">{selected.filename} · {formatSize(selected.size)}</p>

                                    {/* Alignment */}
                                    <div className="mb-3">
                                        <p className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">Căn chỉnh</p>
                                        <div className="flex gap-1">
                                            {(['left', 'center', 'right'] as Align[]).map(a => {
                                                const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
                                                const labels = { left: 'Trái', center: 'Giữa', right: 'Phải' };
                                                return (
                                                    <button
                                                        key={a}
                                                        onClick={() => setAlign(a)}
                                                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${align === a ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
                                                    >
                                                        <Icon className="h-3.5 w-3.5" />
                                                        {labels[a]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Crop toggle */}
                                    <button
                                        onClick={() => { setCropMode(v => !v); if (cropMode) setCompletedCrop(undefined); }}
                                        className={`mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${cropMode ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
                                    >
                                        <Scissors className="h-3.5 w-3.5" />
                                        {cropMode ? 'Huỷ crop' : 'Crop ảnh'}
                                    </button>

                                    {/* Insert */}
                                    <button
                                        onClick={handleInsert}
                                        disabled={inserting}
                                        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                                    >
                                        {inserting ? 'Đang xử lý…' : cropMode && completedCrop ? 'Crop & Chèn ảnh' : 'Chèn ảnh'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile footer — shown when image selected */}
                {selected && (
                    <div className="shrink-0 border-t border-gray-200 px-4 py-3 dark:border-gray-800 md:hidden">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {(['left', 'center', 'right'] as Align[]).map(a => {
                                    const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
                                    return (
                                        <button key={a} onClick={() => setAlign(a)} className={`rounded p-1.5 transition-colors ${align === a ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-100'}`}>
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={handleInsert} disabled={inserting} className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                                {inserting ? '…' : 'Chèn ảnh'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
