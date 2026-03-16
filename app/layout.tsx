import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'runtocoast — personal blog',
    description:
        'Learning by sharing. A personal blog about programming, technology, and life.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var s=localStorage.getItem('darkMode');var d=s==='true'||(s===null&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
                    }}
                />
            </head>
            <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                {children}
            </body>
        </html>
    );
}
