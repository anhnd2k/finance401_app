import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import DeleteUserButton from './DeleteUserButton';
import { requireAuth } from '@/lib/auth';

export default async function AdminUsersPage() {
    const session = await requireAuth();
    if (session.role !== 'ADMIN') {
        return (
            <div className="p-8">
                <p className="text-red-500">
                    Only admins can manage users.
                </p>
            </div>
        );
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            _count: { select: { posts: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Users
                </h1>
                <Link
                    href="/admin/users/new"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    <PlusCircle className="h-4 w-4" />
                    New User
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                            <th className="px-6 py-3">Username</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Posts</th>
                            <th className="px-6 py-3">Joined</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                            {user.username[0]?.toUpperCase()}
                                        </div>
                                        {user.username}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {user.role.toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {user._count.posts}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {formatDate(user.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    {user.username !== session.username && (
                                        <DeleteUserButton id={user.id} />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
