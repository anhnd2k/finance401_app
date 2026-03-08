import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import CategoriesClient from './CategoriesClient';

export default async function AdminCategoriesPage() {
    const session = await requireAuth();
    if (session.role !== 'ADMIN') {
        return (
            <div className="p-8">
                <p className="text-red-500">Only admins can manage categories.</p>
            </div>
        );
    }

    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { posts: true } } },
    });

    return (
        <div className="p-4 md:p-8">
            <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                Categories
            </h1>
            <CategoriesClient initialCategories={categories} />
        </div>
    );
}
