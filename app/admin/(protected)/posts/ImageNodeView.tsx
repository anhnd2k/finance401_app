'use client';

import { useState, lazy, Suspense } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { Pencil, Trash2 } from 'lucide-react';

const MediaPickerModal = lazy(() => import('./MediaPickerModal'));

type Align = 'left' | 'center' | 'right';

const ALIGN_STYLES: Record<Align, string> = {
    left: 'float: left; margin: 0 1rem 1rem 0; max-width: 50%;',
    center: 'display: block; margin: 0 auto; max-width: 100%;',
    right: 'float: right; margin: 0 0 1rem 1rem; max-width: 50%;',
};

export default function ImageNodeView({ node, updateAttributes, deleteNode, selected }: ReactNodeViewProps) {
    const [showPicker, setShowPicker] = useState(false);

    const src: string = node.attrs.src ?? '';
    const style: string = node.attrs.style ?? '';
    const alt: string = node.attrs.alt ?? '';

    // Float/margin/max-width go on NodeViewWrapper so document flow works correctly.
    // The inner div is inline-block to tightly hug the image — overlay will match exactly.
    const wrapperStyle = style ? parseInlineStyle(style) : {};

    return (
        <NodeViewWrapper style={wrapperStyle}>
            {/* inline-block so this div is exactly as wide/tall as the image */}
            <div
                className={`group relative inline-block leading-[0] ${selected ? 'ring-2 ring-blue-500 ring-offset-1 rounded-xl' : ''}`}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    className="block rounded-xl max-w-full"
                    draggable={false}
                />

                {/* Overlay — inset-0 now exactly matches the image dimensions */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowPicker(true);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow hover:bg-white"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Sửa
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteNode();
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-500"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                    </button>
                </div>
            </div>

            {showPicker && (
                <Suspense fallback={null}>
                    <MediaPickerModal
                        initialUrl={src}
                        onInsert={(url, align) => {
                            updateAttributes({ src: url, style: ALIGN_STYLES[align] });
                            setShowPicker(false);
                        }}
                        onClose={() => setShowPicker(false)}
                    />
                </Suspense>
            )}
        </NodeViewWrapper>
    );
}

function parseInlineStyle(style: string): Record<string, string> {
    const result: Record<string, string> = {};
    style.split(';').forEach((rule) => {
        const [prop, val] = rule.split(':').map((s) => s.trim());
        if (prop && val) {
            const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
            result[camel] = val;
        }
    });
    return result;
}
