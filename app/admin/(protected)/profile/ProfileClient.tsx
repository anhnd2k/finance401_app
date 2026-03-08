'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface Props {
    username: string;
    displayName: string | null;
    role: string;
}

export default function ProfileClient({ username, displayName, role }: Props) {
    const [dispName, setDispName] = useState(displayName ?? '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword && newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (newPassword && newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        setSaving(true);
        try {
            const body: Record<string, string> = { displayName: dispName };
            if (newPassword) {
                body.currentPassword = currentPassword;
                body.newPassword = newPassword;
            }

            const res = await fetch('/api/admin/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Failed to update profile');
            } else {
                setSuccess('Profile updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
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
        <div className="max-w-lg">
            {/* Account info */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                        {(dispName || username)[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {username}
                        </p>
                        <p className="text-xs capitalize text-gray-400">{role.toLowerCase()}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        {success}
                    </div>
                )}

                <div className="mb-5">
                    <label className={labelClass}>Username</label>
                    <input
                        type="text"
                        value={username}
                        disabled
                        className={`${inputClass} opacity-60 cursor-not-allowed`}
                    />
                    <p className="mt-1 text-xs text-gray-400">Username cannot be changed.</p>
                </div>

                <div className="mb-6">
                    <label className={labelClass}>Display Name</label>
                    <input
                        type="text"
                        value={dispName}
                        onChange={(e) => setDispName(e.target.value)}
                        className={inputClass}
                        placeholder="Name shown on published posts"
                    />
                </div>

                <div className="mb-5 border-t border-gray-100 pt-5 dark:border-gray-800">
                    <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Change Password
                        <span className="ml-1 text-xs font-normal text-gray-400">(leave blank to keep current)</span>
                    </p>
                    <div className="mb-4">
                        <label className={labelClass}>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={inputClass}
                            autoComplete="current-password"
                        />
                    </div>
                    <div className="mb-4">
                        <label className={labelClass}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClass}
                            autoComplete="new-password"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClass}
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
