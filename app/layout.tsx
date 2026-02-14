import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Finance 401, where I note anything I learned about Finance',
    description:
        'A personal blog documenting my journey and insights in the world of Finance.',
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
                <div className="min-h-screen">
                    <Header />
                    <main className="flex-grow">
                        {children}
                    </main>
                </div>
                <Footer />
            </body>
        </html>
    );
}
