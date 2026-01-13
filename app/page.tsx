import { ArrowRight, Calendar, Sparkles } from 'lucide-react';

export default function Home() {
    const featuredHubs = [
        {
            title: 'Creative Hub',
            description: 'A growing showcase of Codrops originals and hand-picked demos from the creative web.',
            subtext: 'Unfolding Regularly',
            cta: 'Start exploring →',
            type: 'hub',
            bgColor: 'from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20'
        },
        {
            title: 'Webzibition',
            description: 'Discover fresh gems in our handpicked exhibition of over 2,000 standout websites that caught our eye.',
            cta: 'Get inspired →',
            type: 'hub',
            bgColor: 'from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/20'
        },
    ];

    const articles = [
        {
            id: 1,
            title: '8 Best WordPress Themes for Designers (2026): Fast Builds, Clean UI',
            category: 'Sponsored',
            excerpt: 'Explore the top WordPress themes for designers in 2026, featuring fast builds and clean UI designs.',
            image: '/placeholder-themes.jpg',
            featured: true
        },
        {
            id: 2,
            title: "Obys' Design Books: Turning a Reading List Into a Tactile Web Library",
            author: 'by Obys',
            excerpt: 'How Obys transformed a reading list into an immersive tactile web library experience.',
            image: '/placeholder-design-books.jpg',
            readTime: '5 min read'
        },
        {
            id: 3,
            title: 'The Spark: Engineering an Immersive, Story-First Web Experience',
            author: 'by The Digital Panda',
            excerpt: 'Creating immersive web experiences with a story-first approach to digital design.',
            image: '/placeholder-spark.jpg',
            readTime: '7 min read'
        },
        {
            id: 4,
            title: 'From "What\'s a String?" to Sites of the Day: Nathan Dallaire\'s High-End Web Experiences',
            author: 'by Nathan Dallaire',
            excerpt: 'The journey from beginner to creating award-winning high-end web experiences.',
            image: '/placeholder-dallaire.jpg',
            readTime: '8 min read'
        },
        {
            id: 5,
            title: 'Infinite Canvas: Building a Seamless, Pan-Anywhere Image Space',
            author: 'by Edoardo Lunardi',
            excerpt: 'Technical deep dive into creating infinite canvas experiences for web imagery.',
            image: '/placeholder-canvas.jpg',
            readTime: '6 min read'
        },
        {
            id: 6,
            title: '8 Best WordPress Plugins 2026: Animation, Data UI & Builder',
            category: 'Sponsored',
            excerpt: 'Essential WordPress plugins for 2026 focusing on animation, data visualization, and page building.',
            image: '/placeholder-plugins.jpg',
            featured: true
        },
        {
            id: 7,
            title: '8 Best WordPress Plugins 2026: Animation, Data UI & Builder',
            category: 'Sponsored',
            excerpt: 'Essential WordPress plugins for 2026 focusing on animation, data visualization, and page building.',
            image: '/placeholder-plugins.jpg'
        },
        {
            id: 8,
            title: '8 Best WordPress Plugins 2026: Animation, Data UI & Builder',
            category: 'Sponsored',
            excerpt: 'Essential WordPress plugins for 2026 focusing on animation, data visualization, and page building.',
            image: '/placeholder-plugins.jpg'
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Main Articles Grid Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900/30">
                <div className="container mx-auto px-4">
                    {/* Weekly Inspiration Header */}
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Latest Articles
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Read now!
                                </p>
                            </div>
                            <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg">
                                {/* <Calendar className="w-5 h-5 text-gray-400" /> */}
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Total post:</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white ml-2">1</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <article 
                                key={article.id} 
                                className={`bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 group ${
                                    article.featured ? 'lg:col-span-2' : ''
                                    //  lg:row-span-2
                                }`}
                            >
                                {/* Image Placeholder */}
                                <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                                                [Image: {article.image.replace('/placeholder-', '').replace('.jpg', '')}]
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                Replace with your image
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Article Content */}
                                <div className="p-6">
                                    {article.category && (
                                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 ${
                                            article.category === 'Sponsored' 
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                                        }`}>
                                            {article.category}
                                        </span>
                                    )}

                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {article.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {article.excerpt}
                                    </p>

                                    {(article.author || article.readTime) && (
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            {article.author && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {article.author}
                                                </span>
                                            )}
                                            {article.readTime && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {article.readTime}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                    {/* Load More Button */}
                    <div className="text-center mt-12">
                        <button className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300 inline-flex items-center group">
                            Load More Articles
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}