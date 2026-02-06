import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Codrops - Creative Hub & Webzibition',
    description:
        'A growing showcase of Codrops originals and hand-picked demos from the creative web.',
};

import React from 'react';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                <Header />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
