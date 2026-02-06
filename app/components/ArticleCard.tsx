interface ArticleCardProps {
    title: string;
    author?: string;
    type?: string;
    sponsored?: boolean;
    excerpt?: string;
    readTime?: string;
    image?: string;
}

export default function ArticleCard({
    title,
    author,
    type = 'article',
    sponsored = false,
    excerpt,
    readTime,
    image,
}: ArticleCardProps) {
    return (
        <article className="group cursor-pointer">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
                {/* Image Container */}
                {image && (
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-gray-500 dark:text-gray-400 text-sm">
                                    Image: {title.split(' ').slice(0, 3).join(' ')}...
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6">
                    {sponsored && (
                        <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Sponsored
                        </span>
                    )}

                    <h3 className="mb-3 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {title}
                    </h3>

                    {excerpt && (
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            {excerpt}
                        </p>
                    )}

                    {(author || readTime) && (
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                            {author && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {author}
                                </span>
                            )}
                            {readTime && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {readTime}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
