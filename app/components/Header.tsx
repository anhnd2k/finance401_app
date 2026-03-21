'use client';

import {
    useState,
    useEffect,
    useRef,
} from 'react';
import Link from 'next/link';
import {
    useRouter,
    usePathname,
} from 'next/navigation';
import {
    Menu,
    X,
    Sun,
    Moon,
    Search,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import LogoAnimation from './LogoAnimation';
import { type Locale } from '@/lib/locale';
import { getT } from '@/lib/i18n';

interface SearchResult {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    category: { name: string } | null;
}

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] =
        useState(false);
    const [darkMode, setDarkMode] =
        useState(false);
    const [showSearch, setShowSearch] =
        useState(false);
    const [searchQuery, setSearchQuery] =
        useState('');
    const [results, setResults] = useState<
        SearchResult[]
    >([]);
    const [searching, setSearching] =
        useState(false);
    const searchRef =
        useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const locale: Locale = pathname.startsWith(
        '/en'
    )
        ? 'en'
        : 'vi';
    const localePrefix =
        locale === 'en' ? '/en' : '';

    // Sync dark mode with class set by inline script
    useEffect(() => {
        setDarkMode(
            document.documentElement.classList.contains(
                'dark'
            )
        );
    }, []);

    // Close search dropdown on outside click
    useEffect(() => {
        function handleClickOutside(
            e: MouseEvent
        ) {
            if (
                searchRef.current &&
                !searchRef.current.contains(
                    e.target as Node
                )
            ) {
                setShowSearch(false);
                setResults([]);
            }
        }
        document.addEventListener(
            'mousedown',
            handleClickOutside
        );
        return () =>
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current)
            clearTimeout(debounceRef.current);
        if (
            !searchQuery.trim() ||
            searchQuery.length < 2
        ) {
            setResults([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        debounceRef.current = setTimeout(
            async () => {
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
            },
            300
        );
        return () => {
            if (debounceRef.current)
                clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    function toggleDarkMode() {
        const next = !darkMode;
        setDarkMode(next);
        document.documentElement.classList.toggle(
            'dark',
            next
        );
        localStorage.setItem(
            'darkMode',
            String(next)
        );
    }

    function handleSearchSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(
            `/posts?search=${encodeURIComponent(searchQuery)}`
        );
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

    const t = getT(locale);
    const navLinks = [
        {
            name: t.allPosts,
            href: localePrefix + '/posts',
        },
        {
            name: t.about,
            href: localePrefix + '/about',
        },
    ];

    const iconButtons = (
        <>
            <LanguageSwitcher
                pathname={pathname}
            />
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
                        className={`absolute inset-0 h-5 w-5 text-blue-400 transition-all duration-300 ${!darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                    />
                </div>
            </button>
        </>
    );

    return (
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="container mx-auto px-4 py-4">
                {/* ── Mobile header row ─────────────────────────────────── */}
                <div className="flex items-center justify-between md:hidden">
                    {/* Hamburger */}
                    <button
                        onClick={() =>
                            setIsMenuOpen(
                                !isMenuOpen
                            )
                        }
                        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X size={22} />
                        ) : (
                            <Menu size={22} />
                        )}
                    </button>

                    {/* Logo — centered absolutely */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <LogoAnimation
                            href={
                                localePrefix + '/'
                            }
                        />
                    </div>

                    {/* Right spacer to balance hamburger */}
                    <div className="w-10" />
                </div>

                {/* ── Desktop header row ────────────────────────────────── */}
                <div className="hidden md:flex md:items-center md:justify-between">
                    {/* Logo */}
                    <LogoAnimation
                        href={localePrefix + '/'}
                    />

                    {/* Nav */}
                    <nav className="flex items-center space-x-8">
                        {navLinks.map((link) => {
                            const active =
                                pathname ===
                                    link.href ||
                                pathname.startsWith(
                                    link.href +
                                        '/'
                                );
                            return (
                                <Link
                                    key={
                                        link.href
                                    }
                                    href={
                                        link.href
                                    }
                                    className={`font-medium transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Icons */}
                    <div className="flex items-center space-x-2">
                        {iconButtons}
                    </div>
                </div>

                {/* ── Search bar ────────────────────────────────────────── */}
                {showSearch && (
                    <div
                        className="relative mt-4"
                        ref={searchRef}
                    >
                        <form
                            onSubmit={
                                handleSearchSubmit
                            }
                        >
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={
                                        t.searchPlaceholder
                                    }
                                    value={
                                        searchQuery
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSearchQuery(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    autoFocus
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-12 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={
                                        closeSearch
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X
                                        size={18}
                                    />
                                </button>
                            </div>
                        </form>

                        {(searching ||
                            results.length >
                                0) && (
                            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                                {searching && (
                                    <div className="px-4 py-3 text-sm text-gray-400">
                                        {
                                            t.searching
                                        }
                                    </div>
                                )}
                                {!searching &&
                                    results.length ===
                                        0 &&
                                    searchQuery.length >=
                                        2 && (
                                        <div className="px-4 py-3 text-sm text-gray-400">
                                            {
                                                t.noResults
                                            }
                                        </div>
                                    )}
                                {results.map(
                                    (post) => (
                                        <Link
                                            key={
                                                post.id
                                            }
                                            href={`/posts/${post.slug}`}
                                            onClick={
                                                closeSearch
                                            }
                                            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            {post.thumbnail ? (
                                                <img
                                                    src={
                                                        post.thumbnail
                                                    }
                                                    alt=""
                                                    className="h-10 w-16 shrink-0 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-16 shrink-0 rounded bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30" />
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                    {
                                                        post.title
                                                    }
                                                </p>
                                                {post.category && (
                                                    <p className="text-xs text-gray-400">
                                                        {
                                                            post
                                                                .category
                                                                .name
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Mobile dropdown menu ──────────────────────────────── */}
                {isMenuOpen && !showSearch && (
                    <div className="mt-4 border-t border-gray-200 pb-2 pt-4 dark:border-gray-800 md:hidden">
                        <nav className="flex flex-col space-y-1">
                            {navLinks.map(
                                (link) => {
                                    const active =
                                        pathname ===
                                            link.href ||
                                        pathname.startsWith(
                                            link.href +
                                                '/'
                                        );
                                    return (
                                        <Link
                                            key={
                                                link.name
                                            }
                                            href={
                                                link.href
                                            }
                                            className={`rounded-lg px-3 py-2 font-medium transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                                            onClick={() =>
                                                setIsMenuOpen(
                                                    false
                                                )
                                            }
                                        >
                                            {
                                                link.name
                                            }
                                        </Link>
                                    );
                                }
                            )}
                        </nav>
                        <div className="mt-3 flex items-center gap-1 border-t border-gray-100 pt-3 dark:border-gray-800">
                            {iconButtons}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
