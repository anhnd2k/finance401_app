'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteUserButton({ id }: { id: number }) {
    const router = useRouter();

    async function handleDelete() {
        if (!confirm('Delete this user? This cannot be undone.')) return;
        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            router.refresh();
        } else {
            const data = await res.json();
            alert(data.error ?? 'Failed to delete user');
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="rounded p-1 text-gray-400 hover:text-red-600"
            title="Delete user"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}
