import { requireAuth } from '@/lib/auth';
import AdminShell from '../components/AdminShell';

export default async function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireAuth();

    return (
        <AdminShell username={session.username} role={session.role}>
            {children}
        </AdminShell>
    );
}
