'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    usePathname,
    useRouter,
} from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Users,
    Tag,
    LogOut,
    ExternalLink,
    Menu,
    X,
    Banana,
    Images,
    Sun,
    Moon,
} from 'lucide-react';

const navItems = [
    {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        label: 'Posts',
        href: '/admin/posts',
        icon: FileText,
    },
    {
        label: 'Media',
        href: '/admin/media',
        icon: Images,
    },
    {
        label: 'Categories',
        href: '/admin/categories',
        icon: Tag,
    },
    {
        label: 'About',
        href: '/admin/about',
        icon: Banana,
    },
    {
        label: 'Users',
        href: '/admin/users',
        icon: Users,
    },
];

interface SidebarProps {
    username: string;
    role: string;
    pathname: string;
    onLogout: () => void;
    darkMode: boolean;
    onToggleDark: () => void;
}

function SidebarContent({
    username,
    role,
    pathname,
    onLogout,
    darkMode,
    onToggleDark,
}: SidebarProps) {
    return (
        <>
            {/* Brand */}
            <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"
                >
                    <span className="text-lg">
                        runtocoast
                    </span>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                </Link>
                <p className="mt-0.5 text-xs text-gray-400">
                    Admin Panel
                </p>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4">
                {navItems.map((item) => {
                    const active =
                        item.href === '/admin'
                            ? pathname ===
                              '/admin'
                            : pathname.startsWith(
                                  item.href
                              );
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                active
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                <Link
                    href="/admin/profile"
                    className="mb-3 flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {username[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {username}
                        </p>
                        <p className="text-xs capitalize text-gray-400">
                            {role.toLowerCase()}
                        </p>
                    </div>
                </Link>
                <div className="mb-1 flex items-center justify-between">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                    <button
                        onClick={onToggleDark}
                        title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </>
    );
}

interface Props {
    username: string;
    role: string;
    children: React.ReactNode;
}

export default function AdminShell({
    username,
    role,
    children,
}: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] =
        useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Init dark mode from localStorage / class
    useEffect(() => {
        const saved = localStorage.getItem('adminDarkMode');
        const isDark = saved !== null
            ? saved === 'true'
            : document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    function toggleDarkMode() {
        const next = !darkMode;
        setDarkMode(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('adminDarkMode', String(next));
    }

    // Close sidebar on route change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSidebarOpen(false);
    }, [pathname]);

    async function handleLogout() {
        await fetch('/api/auth/logout', {
            method: 'POST',
        });
        router.push('/admin/login');
        router.refresh();
    }

    return (
        <div className="flex h-screen">
            {/* Desktop sidebar */}
            <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:flex">
                <SidebarContent
                    username={username}
                    role={role}
                    pathname={pathname}
                    onLogout={handleLogout}
                    darkMode={darkMode}
                    onToggleDark={toggleDarkMode}
                />
            </aside>

            {/* Mobile overlay backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            {/* Mobile sidebar drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 md:hidden ${
                    sidebarOpen
                        ? 'translate-x-0'
                        : '-translate-x-full'
                }`}
            >
                <button
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                    className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close sidebar"
                >
                    <X className="h-5 w-5" />
                </button>
                <SidebarContent
                    username={username}
                    role={role}
                    pathname={pathname}
                    onLogout={handleLogout}
                    darkMode={darkMode}
                    onToggleDark={toggleDarkMode}
                />
            </aside>

            {/* Main area */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Mobile top bar */}
                <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 md:hidden">
                    <button
                        onClick={() =>
                            setSidebarOpen(true)
                        }
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="flex-1 font-semibold text-gray-900 dark:text-white">
                        runtocoast Admin
                    </span>
                    <button
                        onClick={toggleDarkMode}
                        title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                </header>

                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
