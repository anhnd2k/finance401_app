'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon, Search } from 'lucide-react';

interface SearchResult {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    category: { name: string } | null;
}

const navLinks = [
    { name: 'All Posts', href: '/posts' },
    { name: 'About', href: '/about' },
];

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync React state with the class already set by the inline script
    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
    }, []);

    // Close search dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                searchRef.current &&
                !searchRef.current.contains(e.target as Node)
            ) {
                setShowSearch(false);
                setResults([]);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setResults([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(searchQuery)}`
                );
                const data = await res.json();
                setResults(data);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    function toggleDarkMode() {
        const next = !darkMode;
        setDarkMode(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('darkMode', String(next));
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/posts?search=${encodeURIComponent(searchQuery)}`);
        closeSearch();
    }

    function closeSearch() {
        setShowSearch(false);
        setSearchQuery('');
        setResults([]);
    }

    function openSearch() {
        setShowSearch(true);
        setIsMenuOpen(false);
    }

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight"
                    >
                        FINANCE401
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden items-center space-x-8 md:flex">
                        {navLinks.map((link) => {
                            const active = pathname === link.href || pathname.startsWith(link.href + '/');
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`font-medium transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Icon buttons */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={openSearch}
                            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>

                        <button
                            onClick={toggleDarkMode}
                            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label={
                                darkMode
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'
                            }
                        >
                            <div className="relative h-5 w-5">
                                <Sun
                                    className={`absolute inset-0 h-5 w-5 text-yellow-500 transition-all duration-300 ${darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                                />
                                <Moon
                                    className={`absolute inset-0 h-5 w-5 text-blue-400 transition-all duration-300 ${darkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
                                />
                            </div>
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Search bar + dropdown */}
                {showSearch && (
                    <div className="relative mt-4" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit}>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search posts by title or tag…"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    autoFocus
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-12 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={closeSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </form>

                        {/* Results dropdown */}
                        {(searching || results.length > 0) && (
                            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                                {searching && (
                                    <div className="px-4 py-3 text-sm text-gray-400">
                                        Searching…
                                    </div>
                                )}
                                {!searching && results.length === 0 && searchQuery.length >= 2 && (
                                    <div className="px-4 py-3 text-sm text-gray-400">
                                        No results found.
                                    </div>
                                )}
                                {results.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/posts/${post.slug}`}
                                        onClick={closeSearch}
                                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        {post.thumbnail ? (
                                            <img
                                                src={post.thumbnail}
                                                alt=""
                                                className="h-10 w-16 shrink-0 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-16 shrink-0 rounded bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30" />
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                {post.title}
                                            </p>
                                            {post.category && (
                                                <p className="text-xs text-gray-400">
                                                    {post.category.name}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile menu */}
                {isMenuOpen && !showSearch && (
                    <div className="mt-4 border-t border-gray-200 pb-4 pt-4 dark:border-gray-800 md:hidden">
                        <div className="flex flex-col space-y-3">
                            {navLinks.map((link) => {
                                const active = pathname === link.href || pathname.startsWith(link.href + '/');
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`py-2 font-medium transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
