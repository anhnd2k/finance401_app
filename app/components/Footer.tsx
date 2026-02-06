import Link from 'next/link';
import {
    Linkedin,
    Instagram,
    Twitter,
    Facebook,
    MessageSquare,
    Rss,
    Github,
    ExternalLink,
} from 'lucide-react';

export default function Footer() {
    const footerLinks = {
        explore: [
            { name: 'home', href: '#' },
            { name: 'articles', href: '#' },
            { name: 'tutorials', href: '#' },
            { name: 'playground', href: '#' },
        ],
        resources: [
            { name: 'creative hub', href: '#' },
            { name: 'webzibition', href: '#' },
            { name: 'css reference', href: '#' },
            { name: 'freebies', href: '#' },
        ],
        company: [
            { name: 'about', href: '#' },
            { name: 'get in touch', href: '#' },
            { name: 'subscribe', href: '#' },
            { name: 'advertise', href: '#' },
            { name: 'privacy policy', href: '#' },
            { name: 'license', href: '#' },
        ],
    };

    const socialLinks = [
        {
            icon: Linkedin,
            name: 'linkedin',
            href: '#',
        },
        {
            icon: Instagram,
            name: 'instagram',
            href: '#',
        },
        {
            icon: Twitter,
            name: 'x (twitter)',
            href: '#',
        },
        {
            icon: MessageSquare,
            name: 'bluesky',
            href: '#',
        },
        {
            icon: Facebook,
            name: 'facebook',
            href: '#',
        },
        {
            icon: Rss,
            name: 'rss feed',
            href: '#',
        },
        {
            icon: Github,
            name: 'github',
            href: '#',
        },
    ];

    return (
        <footer className="mt-auto border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Explore Section */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Học...
                        </h3>
                        {/* <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white capitalize transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul> */}
                    </div>

                    {/* Resources Section */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Học nữa...
                        </h3>
                        {/* <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white capitalize transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul> */}
                    </div>

                    {/* Company Section */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Học mãi...
                        </h3>
                        {/* <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white capitalize transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul> */}
                    </div>

                    {/* Social Links Section */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Follow Finance401
                        </h3>
                        <div className="mb-8 flex flex-wrap gap-3">
                            {socialLinks.map(
                                (social) => (
                                    <a
                                        key={
                                            social.name
                                        }
                                        href={
                                            social.href
                                        }
                                        className="rounded-lg bg-gray-200 p-2 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                                        aria-label={
                                            social.name
                                        }
                                    >
                                        <social.icon className="h-5 w-5" />
                                    </a>
                                )
                            )}
                        </div>

                        {/* Hosting Partners */}
                        {/* <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Proudly hosted by
                                </p>
                                <a 
                                    href="#" 
                                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                  Liquid Web <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Content delivered by
                                </p>
                                <a 
                                    href="#" 
                                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                  @keycdn <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 border-t border-gray-300 pt-8 text-center dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © Finance401 2026
                    </p>
                </div>
            </div>
        </footer>
    );
}
