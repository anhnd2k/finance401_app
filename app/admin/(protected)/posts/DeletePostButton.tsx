'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeletePostButton({ id }: { id: number }) {
    const router = useRouter();

    async function handleDelete() {
        if (!confirm('Delete this post? This cannot be undone.')) return;
        const res = await fetch(`/api/admin/posts/${id}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            router.refresh();
        } else {
            alert('Failed to delete post');
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="rounded p-1 text-gray-400 hover:text-red-600"
            title="Delete"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}
