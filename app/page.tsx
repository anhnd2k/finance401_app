import {
    ArrowRight,
    Calendar,
    Sparkles,
} from 'lucide-react';

export default function Home() {
    const featuredHubs = [
        {
            title: 'Creative Hub',
            description:
                'A growing showcase of Codrops originals and hand-picked demos from the creative web.',
            subtext: 'Unfolding Regularly',
            cta: 'Start exploring →',
            type: 'hub',
            bgColor:
                'from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20',
        },
        {
            title: 'Webzibition',
            description:
                'Discover fresh gems in our handpicked exhibition of over 2,000 standout websites that caught our eye.',
            cta: 'Get inspired →',
            type: 'hub',
            bgColor:
                'from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/20',
        },
    ];

    const articles = [
        {
            id: 1,
            title: '8 Best WordPress Themes for Designers (2026): Fast Builds, Clean UI',
            category: 'Sponsored',
            excerpt:
                'Explore the top WordPress themes for designers in 2026, featuring fast builds and clean UI designs.',
            image: '/placeholder-themes.jpg',
            featured: true,
        },
        {
            id: 2,
            title: "Obys' Design Books: Turning a Reading List Into a Tactile Web Library",
            author: 'by Obys',
            excerpt:
                'How Obys transformed a reading list into an immersive tactile web library experience.',
            image: '/placeholder-design-books.jpg',
            readTime: '5 min read',
        },
        {
            id: 3,
            title: 'The Spark: Engineering an Immersive, Story-First Web Experience',
            author: 'by The Digital Panda',
            excerpt:
                'Creating immersive web experiences with a story-first approach to digital design.',
            image: '/placeholder-spark.jpg',
            readTime: '7 min read',
        },
        {
            id: 4,
            title: 'From "What\'s a String?" to Sites of the Day: Nathan Dallaire\'s High-End Web Experiences',
            author: 'by Nathan Dallaire',
            excerpt:
                'The journey from beginner to creating award-winning high-end web experiences.',
            image: '/placeholder-dallaire.jpg',
            readTime: '8 min read',
        },
        {
            id: 5,
            title: 'Infinite Canvas: Building a Seamless, Pan-Anywhere Image Space',
            author: 'by Edoardo Lunardi',
            excerpt:
                'Technical deep dive into creating infinite canvas experiences for web imagery.',
            image: '/placeholder-canvas.jpg',
            readTime: '6 min read',
        },
        {
            id: 6,
            title: '8 Best WordPress Plugins 2026: Animation, Data UI & Builder',
            category: 'Sponsored',
            excerpt:
                'Essential WordPress plugins for 2026 focusing on animation, data visualization, and page building.',
            image: '/placeholder-plugins.jpg',
            featured: true,
        },
        {
            id: 7,
            title: '8 Best WordPress Plugins 2026: Animation, Data UI & Builder',
            category: 'Sponsored',
            excerpt:
                'Essential WordPress plugins for 2026 focusing on animation, data visualization, and page building.',
            image: '/placeholder-plugins.jpg',
        },
        {
            id: 8,
            title: '8 Best WordPress Plugins 2026: Animation, Data UI & Builder',
            category: 'Sponsored',
            excerpt:
                'Essential WordPress plugins for 2026 focusing on animation, data visualization, and page building.',
            image: '/placeholder-plugins.jpg',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Main Articles Grid Section */}
            <section className="bg-gray-50 py-16 dark:bg-gray-900/30">
                <div className="container mx-auto px-4">
                    {/* Weekly Inspiration Header */}
                    <div className="mb-12">
                        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                                    Latest
                                    Articles
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Read now!
                                </p>
                            </div>
                            <div className="flex items-center space-x-4 rounded-lg bg-white px-4 py-3 dark:bg-gray-800">
                                {/* <Calendar className="w-5 h-5 text-gray-400" /> */}
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Total
                                        post:
                                    </span>
                                    <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                                        1
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {articles.map(
                            (article) => (
                                <article
                                    key={
                                        article.id
                                    }
                                    className={`group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 ${
                                        article.featured
                                            ? 'lg:col-span-2'
                                            : ''
                                        //  lg:row-span-2
                                    }`}
                                >
                                    {/* Image Placeholder */}
                                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 md:h-56">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                    [Image:{' '}
                                                    {article.image
                                                        .replace(
                                                            '/placeholder-',
                                                            ''
                                                        )
                                                        .replace(
                                                            '.jpg',
                                                            ''
                                                        )}
                                                    ]
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    Replace
                                                    with
                                                    your
                                                    image
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Article Content */}
                                    <div className="p-6">
                                        {article.category && (
                                            <span
                                                className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                                    article.category ===
                                                    'Sponsored'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                }`}
                                            >
                                                {
                                                    article.category
                                                }
                                            </span>
                                        )}

                                        <h3 className="mb-3 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                            {
                                                article.title
                                            }
                                        </h3>

                                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                                            {
                                                article.excerpt
                                            }
                                        </p>

                                        {(article.author ||
                                            article.readTime) && (
                                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                                                {article.author && (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {
                                                            article.author
                                                        }
                                                    </span>
                                                )}
                                                {article.readTime && (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {
                                                            article.readTime
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                    {/* Load More Button */}
                    <div className="mt-12 text-center">
                        <button className="group inline-flex items-center rounded-lg bg-gray-900 px-8 py-3 font-semibold text-white transition-colors duration-300 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                            Load More Articles
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
