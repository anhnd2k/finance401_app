import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="min-h-screen flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
