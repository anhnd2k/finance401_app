'use client';

import { useState } from 'react';
import { Trash2, PlusCircle } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    _count: { posts: number };
}

export default function CategoriesClient({
    initialCategories,
}: {
    initialCategories: Category[];
}) {
    const [categories, setCategories] = useState(initialCategories);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;
        setAdding(true);
        setError('');
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Failed to add category');
            } else {
                setCategories((prev) =>
                    [...prev, { ...data, _count: { posts: 0 } }].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                );
                setNewName('');
            }
        } catch {
            setError('Network error');
        } finally {
            setAdding(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this category? Posts in this category will become uncategorised.'))
            return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setCategories((prev) => prev.filter((c) => c.id !== id));
            }
        } catch {
            // ignore
        }
    }

    return (
        <div className="max-w-xl">
            {/* Add form */}
            <form onSubmit={handleAdd} className="mb-6 flex gap-3">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New category name…"
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                    type="submit"
                    disabled={adding || !newName.trim()}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    <PlusCircle className="h-4 w-4" />
                    Add
                </button>
            </form>

            {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                </p>
            )}

            {/* List */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                {categories.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm text-gray-400">
                        No categories yet.
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                <th className="px-4 py-3 md:px-6">Name</th>
                                <th className="px-4 py-3 md:px-6">Slug</th>
                                <th className="px-4 py-3 md:px-6">Posts</th>
                                <th className="px-4 py-3 md:px-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {categories.map((cat) => (
                                <tr
                                    key={cat.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white md:px-6">
                                        {cat.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 md:px-6">
                                        {cat.slug}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 md:px-6">
                                        {cat._count.posts}
                                    </td>
                                    <td className="px-4 py-3 md:px-6">
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="rounded p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
