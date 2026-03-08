import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
    const session = await requireAuth();
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { username: true, displayName: true, role: true },
    });

    return (
        <div className="p-4 md:p-8">
            <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                My Profile
            </h1>
            <ProfileClient
                username={user?.username ?? session.username}
                displayName={user?.displayName ?? null}
                role={user?.role ?? session.role}
            />
        </div>
    );
}
