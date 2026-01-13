import Link from 'next/link';
import { 
    Linkedin, Instagram, Twitter, Facebook, 
    MessageSquare, Rss, Github, ExternalLink 
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
        { icon: Linkedin, name: 'linkedin', href: '#' },
        { icon: Instagram, name: 'instagram', href: '#' },
        { icon: Twitter, name: 'x (twitter)', href: '#' },
        { icon: MessageSquare, name: 'bluesky', href: '#' },
        { icon: Facebook, name: 'facebook', href: '#' },
        { icon: Rss, name: 'rss feed', href: '#' },
        { icon: Github, name: 'github', href: '#' },
    ];

    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Explore Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
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
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
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
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
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
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            Follow Finance401
                        </h3>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
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
                <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        © Finance401 2026
                    </p>
                </div>
            </div>
        </footer>
    );
}