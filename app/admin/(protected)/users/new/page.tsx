'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('WRITER');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role }),
            });
            if (res.ok) {
                router.push('/admin/users');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error ?? 'Failed to create user');
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
        <div className="p-8">
            <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                New User
            </h1>

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"
            >
                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="mb-5">
                    <label className={labelClass}>
                        Username <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                        className={inputClass}
                    />
                </div>

                <div className="mb-5">
                    <label className={labelClass}>
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={inputClass}
                    />
                </div>

                <div className="mb-8">
                    <label className={labelClass}>Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={inputClass}
                    >
                        <option value="WRITER">Writer</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? 'Creating…' : 'Create User'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/users')}
                        className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
