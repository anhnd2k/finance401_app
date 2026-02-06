'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Menu,
    X,
    Sun,
    Moon,
    Search,
} from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] =
        useState(false);
    const [darkMode, setDarkMode] =
        useState(false);
    const [showSearch, setShowSearch] =
        useState(false);
    const [searchQuery, setSearchQuery] =
        useState('');

    // Kiểm tra theme từ localStorage và system preference
    useEffect(() => {
        const isDark =
            localStorage.getItem('darkMode') ===
                'true' ||
            (!('darkMode' in localStorage) &&
                window.matchMedia(
                    '(prefers-color-scheme: dark)'
                ).matches);

        if (isDark) {
            document.documentElement.classList.add(
                'dark'
            );
        } else {
            document.documentElement.classList.remove(
                'dark'
            );
        }
    }, []);

    // Toggle dark/light mode
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add(
                'dark'
            );
            localStorage.setItem(
                'darkMode',
                'true'
            );
        } else {
            document.documentElement.classList.remove(
                'dark'
            );
            localStorage.setItem(
                'darkMode',
                'false'
            );
        }
    };

    const handleSearch = (e: {
        preventDefault: () => void;
    }) => {
        e.preventDefault();
        console.log(
            'Searching for:',
            searchQuery
        );
        setShowSearch(false);
    };

    const navLinks = [
        { name: 'All Posts', href: '#' },
        { name: 'About', href: '#' },
        // { name: 'Webzibition', href: '#' },
    ];

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

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center space-x-8 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Icons Container */}
                    <div className="flex items-center space-x-4">
                        {/* Search Toggle Button */}
                        <button
                            onClick={() =>
                                setShowSearch(
                                    !showSearch
                                )
                            }
                            className="group relative rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <span className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700">
                                Search
                            </span>
                        </button>

                        {/* Dark Mode Toggle Button */}
                        <button
                            onClick={
                                toggleDarkMode
                            }
                            className="group relative rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label={
                                darkMode
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'
                            }
                        >
                            <div className="relative h-6 w-6">
                                <Sun
                                    className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transform text-yellow-500 transition-all duration-300 ${darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                                />
                                <Moon
                                    className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transform text-blue-400 transition-all duration-300 ${darkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
                                />
                            </div>
                            <span className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700">
                                {darkMode
                                    ? 'Light mode'
                                    : 'Dark mode'}
                            </span>
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() =>
                                setIsMenuOpen(
                                    !isMenuOpen
                                )
                            }
                            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Search Bar (Expands when search button clicked) */}
                {showSearch && (
                    <div className="mt-4">
                        <form
                            onSubmit={
                                handleSearch
                            }
                            className="relative"
                        >
                            <input
                                type="text"
                                placeholder="Search on Codrops..."
                                value={
                                    searchQuery
                                }
                                onChange={(e) =>
                                    setSearchQuery(
                                        e.target
                                            .value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                                autoFocus
                            />
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowSearch(
                                        false
                                    )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                aria-label="Close search"
                            >
                                <X size={20} />
                            </button>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMenuOpen && !showSearch && (
                    <div className="mt-4 border-t border-gray-200 pb-4 pt-4 dark:border-gray-800 md:hidden">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map(
                                (link) => (
                                    <Link
                                        key={
                                            link.name
                                        }
                                        href={
                                            link.href
                                        }
                                        className="py-2 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
