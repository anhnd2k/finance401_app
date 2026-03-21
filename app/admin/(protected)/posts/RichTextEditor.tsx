'use client';

import { useState, lazy, Suspense } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Quote,
    ImageIcon,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import ImageNodeView from './ImageNodeView';

const MediaPickerModal = lazy(() => import('./MediaPickerModal'));

type Align = 'left' | 'center' | 'right';

type Mode = 'wysiwyg' | 'html' | 'preview';
type HeadingLevel = 1 | 2 | 3 | 4;

interface Props {
    value: string;
    onChange: (html: string) => void;
    formId?: string;
    saving?: boolean;
    isEditPost?: boolean;
}

function Divider() {
    return <div className="mx-0.5 w-px self-stretch bg-gray-200 dark:bg-gray-700" />;
}

function TBtn({
    active,
    disabled,
    onClick,
    title,
    children,
}: {
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`rounded p-1.5 transition-colors disabled:opacity-40 ${
                active
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
        >
            {children}
        </button>
    );
}

const LINE_HEIGHTS = [
    { label: 'Default', value: '' },
    { label: '1.0', value: '1' },
    { label: '1.25', value: '1.25' },
    { label: '1.5', value: '1.5' },
    { label: '1.75', value: '1.75' },
    { label: '2.0', value: '2' },
    { label: '2.5', value: '2.5' },
    { label: '3.0', value: '3' },
];

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        lineHeight: {
            setLineHeight: (lineHeight: string) => ReturnType;
            unsetLineHeight: () => ReturnType;
        };
    }
}

const LineHeight = Extension.create({
    name: 'lineHeight',
    addGlobalAttributes() {
        return [{
            types: ['paragraph', 'heading'],
            attributes: {
                lineHeight: {
                    default: null,
                    parseHTML: (el: HTMLElement) => el.style.lineHeight || null,
                    renderHTML: (attrs: Record<string, string>) =>
                        attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {},
                },
            },
        }];
    },
    addCommands() {
        return {
            setLineHeight: (lineHeight: string) => ({ commands }) =>
                (['paragraph', 'heading'] as const).every((t) =>
                    commands.updateAttributes(t, { lineHeight: lineHeight || null })
                ),
            unsetLineHeight: () => ({ commands }) =>
                (['paragraph', 'heading'] as const).every((t) =>
                    commands.resetAttributes(t, 'lineHeight')
                ),
        };
    },
});

export const ALIGN_STYLES: Record<Align, string> = {
    left: 'float: left; margin: 0 1rem 1rem 0; max-width: 50%;',
    center: 'display: block; margin: 0 auto; max-width: 100%;',
    right: 'float: right; margin: 0 0 1rem 1rem; max-width: 50%;',
};

const ClickableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: { default: null },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView);
    },
});

export default function RichTextEditor({ value, onChange, formId, saving, isEditPost }: Props) {
    const [mode, setMode] = useState<Mode>('wysiwyg');
    const [showPicker, setShowPicker] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            LineHeight,
            ClickableImage,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl focus:outline-none p-4',
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    function getBlockType(): string {
        if (!editor) return 'paragraph';
        for (const level of [1, 2, 3, 4] as HeadingLevel[]) {
            if (editor.isActive('heading', { level })) return `h${level}`;
        }
        return 'paragraph';
    }

    function setBlockType(val: string) {
        if (!editor) return;
        if (val === 'paragraph') {
            editor.chain().focus().setParagraph().run();
        } else {
            const level = parseInt(val[1]) as HeadingLevel;
            editor.chain().focus().setHeading({ level }).run();
        }
    }

    function switchMode(next: Mode) {
        if (next === 'wysiwyg' && editor) {
            editor.commands.setContent(value);
        }
        setMode(next);
    }

    const isEdit = mode === 'wysiwyg';

    const contentStyle = fullscreen
        ? { height: 'calc(100vh - 48px)' }
        : { minHeight: '400px', maxHeight: 'calc(100vh - 200px)' };

    return (
        <div className={`overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 ${fullscreen ? 'fixed inset-0 z-50 flex flex-col rounded-none border-0' : ''}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800 shrink-0">
                {/* Block type */}
                <select
                    value={isEdit ? getBlockType() : 'paragraph'}
                    onChange={(e) => setBlockType(e.target.value)}
                    disabled={!isEdit}
                    className="mr-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                    <option value="paragraph">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                </select>

                <Divider />

                {/* Bold / Italic */}
                <TBtn
                    active={isEdit && !!editor?.isActive('bold')}
                    disabled={!isEdit}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </TBtn>
                <TBtn
                    active={isEdit && !!editor?.isActive('italic')}
                    disabled={!isEdit}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </TBtn>

                <Divider />

                {/* Alignment */}
                <TBtn
                    active={isEdit && !!editor?.isActive({ textAlign: 'left' })}
                    disabled={!isEdit}
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </TBtn>
                <TBtn
                    active={isEdit && !!editor?.isActive({ textAlign: 'center' })}
                    disabled={!isEdit}
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </TBtn>
                <TBtn
                    active={isEdit && !!editor?.isActive({ textAlign: 'right' })}
                    disabled={!isEdit}
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </TBtn>
                <TBtn
                    active={isEdit && !!editor?.isActive({ textAlign: 'justify' })}
                    disabled={!isEdit}
                    onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                    title="Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </TBtn>

                <Divider />

                {/* Lists */}
                <TBtn
                    active={isEdit && !!editor?.isActive('bulletList')}
                    disabled={!isEdit}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </TBtn>
                <TBtn
                    active={isEdit && !!editor?.isActive('orderedList')}
                    disabled={!isEdit}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </TBtn>

                <Divider />

                {/* Blockquote */}
                <TBtn
                    active={isEdit && !!editor?.isActive('blockquote')}
                    disabled={!isEdit}
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </TBtn>

                <Divider />

                {/* Line height */}
                <select
                    value={isEdit ? (editor?.getAttributes('paragraph').lineHeight ?? editor?.getAttributes('heading').lineHeight ?? '') : ''}
                    onChange={(e) => {
                        if (!editor) return;
                        if (e.target.value) editor.chain().focus().setLineHeight(e.target.value).run();
                        else editor.chain().focus().unsetLineHeight().run();
                    }}
                    disabled={!isEdit}
                    title="Line Height"
                    className="mr-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                    {LINE_HEIGHTS.map((lh) => (
                        <option key={lh.value} value={lh.value}>{lh.label}</option>
                    ))}
                </select>

                <Divider />

                {/* Insert image */}
                <TBtn
                    active={false}
                    disabled={!isEdit}
                    onClick={() => setShowPicker(true)}
                    title="Insert Image"
                >
                    <ImageIcon className="h-4 w-4" />
                </TBtn>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Mode tabs */}
                <div className="flex overflow-hidden rounded-md border border-gray-200 text-xs dark:border-gray-700">
                    {(['wysiwyg', 'html', 'preview'] as Mode[]).map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => switchMode(m)}
                            className={`px-3 py-1.5 font-medium transition-colors ${
                                mode === m
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                            }`}
                        >
                            {m === 'wysiwyg' ? 'Edit' : m === 'html' ? 'HTML' : 'Preview'}
                        </button>
                    ))}
                </div>

                {/* Fullscreen toggle */}
                <button
                    type="button"
                    onClick={() => setFullscreen((v) => !v)}
                    title={fullscreen ? 'Thu nhỏ' : 'Mở rộng toàn màn hình'}
                    className="ml-1 rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                    {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>

                {/* Submit button — only shown in fullscreen */}
                {fullscreen && formId && (
                    <button
                        type="submit"
                        form={formId}
                        disabled={saving}
                        className="ml-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? 'Saving…' : isEditPost ? 'Update Post' : 'Create Post'}
                    </button>
                )}
            </div>

            {/* WYSIWYG */}
            {mode === 'wysiwyg' && (
                <div className="overflow-y-auto [&_.ProseMirror]:break-words" style={contentStyle}>
                    <div className={fullscreen ? 'mx-auto w-full max-w-3xl' : ''}>
                        <EditorContent editor={editor} />
                    </div>
                </div>
            )}

            {/* HTML source */}
            {mode === 'html' && (
                <div className="overflow-y-auto" style={contentStyle}>
                    <div className={fullscreen ? 'mx-auto w-full max-w-3xl h-full' : 'h-full'}>
                        <textarea
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="h-full min-h-full w-full bg-gray-50 p-4 font-mono text-xs text-gray-800 focus:outline-none dark:bg-gray-800/50 dark:text-gray-200"
                            style={{ resize: 'none', wordBreak: 'break-all' }}
                            spellCheck={false}
                        />
                    </div>
                </div>
            )}

            {/* Preview */}
            {mode === 'preview' && (
                <div className="overflow-y-auto" style={contentStyle}>
                    <div
                        className="prose prose-lg mx-auto max-w-3xl break-words p-6 dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{
                            __html: value || '<p class="text-gray-400 not-prose">Nothing to preview yet…</p>',
                        }}
                    />
                </div>
            )}

            {showPicker && (
                <Suspense fallback={null}>
                    <MediaPickerModal
                        onInsert={(url, align) => {
                            if (editor) {
                                editor.chain().focus().setImage({ src: url }).run();
                                editor.chain().focus().updateAttributes('image', { style: ALIGN_STYLES[align] }).run();
                            }
                            setShowPicker(false);
                        }}
                        onClose={() => setShowPicker(false)}
                    />
                </Suspense>
            )}
        </div>
    );
}
