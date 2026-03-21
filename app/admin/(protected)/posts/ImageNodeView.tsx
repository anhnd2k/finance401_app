'use client';

import { useState, useRef, lazy, Suspense } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { Pencil, Trash2, GripVertical } from 'lucide-react';

const MediaPickerModal = lazy(() => import('./MediaPickerModal'));

type Align = 'left' | 'center' | 'right';

export const ALIGN_STYLES: Record<Align, string> = {
    left: 'float: left; margin: 0 1rem 1rem 0; max-width: 50%;',
    center: 'display: block; margin: 0 auto; max-width: 100%;',
    right: 'float: right; margin: 0 0 1rem 1rem; max-width: 50%;',
};

function detectAlign(style: string): Align | null {
    if (style.includes('margin: 0 auto')) return 'center';
    if (style.includes('float: left')) return 'left';
    if (style.includes('float: right')) return 'right';
    return null;
}

export default function ImageNodeView({ node, updateAttributes, deleteNode, selected }: ReactNodeViewProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [resizeWidth, setResizeWidth] = useState<number | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const src: string = node.attrs.src ?? '';
    const style: string = node.attrs.style ?? '';
    const alt: string = node.attrs.alt ?? '';
    const savedWidth: number | null = node.attrs.width ?? null;

    const displayWidth = resizeWidth ?? savedWidth ?? undefined;
    const align = detectAlign(style);

    // NodeViewWrapper styles: float for left/right; flex-center for center alignment
    const wrapperStyle: React.CSSProperties =
        align === 'center'
            ? { display: 'flex', justifyContent: 'center' }
            : align === 'left'
              ? { float: 'left', margin: '0 1rem 1rem 0', maxWidth: '50%' }
              : align === 'right'
                ? { float: 'right', margin: '0 0 1rem 1rem', maxWidth: '50%' }
                : {};

    function startResize(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startWidth = imgRef.current?.offsetWidth ?? 200;
        const naturalW = imgRef.current?.naturalWidth ?? 1;
        const naturalH = imgRef.current?.naturalHeight ?? 1;
        const aspectRatio = naturalH / naturalW;

        function onMouseMove(ev: MouseEvent) {
            setResizeWidth(Math.max(60, startWidth + (ev.clientX - startX)));
        }

        function onMouseUp(ev: MouseEvent) {
            const newWidth = Math.max(60, startWidth + (ev.clientX - startX));
            updateAttributes({ width: newWidth, height: Math.round(newWidth * aspectRatio) });
            setResizeWidth(null);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    return (
        <NodeViewWrapper style={wrapperStyle}>
            <div
                className={`group relative inline-block leading-[0] ${selected ? 'ring-2 ring-blue-500 ring-offset-1 rounded-xl' : ''}`}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className="block rounded-xl max-w-full"
                    style={{ width: displayWidth ? `${displayWidth}px` : undefined, height: 'auto' }}
                    draggable={false}
                />

                {/* Toolbar */}
                <div className="pointer-events-none absolute left-2 right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowPicker(true);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-gray-800 shadow-md ring-1 ring-black/10 hover:bg-white"
                    >
                        <Pencil className="h-3 w-3" />
                        Sửa
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteNode();
                        }}
                        className="flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-red-600"
                    >
                        <Trash2 className="h-3 w-3" />
                        Xóa
                    </button>
                </div>

                {/* Resize handle */}
                <div
                    className="pointer-events-none absolute bottom-1 right-1 opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                    onMouseDown={startResize}
                    title="Kéo để thay đổi kích thước"
                >
                    <div className="flex h-6 w-6 cursor-se-resize items-center justify-center rounded-bl-lg rounded-tr-xl bg-white/95 shadow-md ring-1 ring-black/10">
                        <GripVertical className="h-3.5 w-3.5 rotate-90 text-gray-600" />
                    </div>
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
