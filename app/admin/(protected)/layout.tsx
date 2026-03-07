import { requireAuth } from '@/lib/auth';
import AdminSidebar from '../components/AdminSidebar';

export default async function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireAuth();

    return (
        <div className="flex min-h-screen">
            <AdminSidebar
                username={session.username}
                role={session.role}
            />
            <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
                {children}
            </main>
        </div>
    );
}
