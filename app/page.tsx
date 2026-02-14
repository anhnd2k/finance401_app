import HeaderCategory from './components/home/HeaderCategory';
import HomeBody from './components/home/HomeBody';

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Main Articles Grid Section */}
            <section className="bg-gray-50 py-16 dark:bg-gray-900/30">
                <div className="container mx-auto px-4">
                    <HeaderCategory />
                    <HomeBody />
                </div>
            </section>
        </div>
    );
}
