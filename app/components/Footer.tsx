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
        <footer className="mt-auto border-t">
            <div className="container mx-auto px-4 py-12">
                {/* <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"> */}
                {/* Explore Section */}

                {/* Social Links Section */}
                {/* <div>
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
                    </div> */}
                {/* </div> */}

                {/* Copyright */}
                <div className="mt-5 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © Finance401 2026
                    </p>
                </div>
            </div>
        </footer>
    );
}
