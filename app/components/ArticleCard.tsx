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
    image
}: ArticleCardProps) {
    return (
        <article className="group cursor-pointer">
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-lg">
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
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mb-3">
                Sponsored
                        </span>
                    )}
            
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {title}
                    </h3>
            
                    {excerpt && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {excerpt}
                        </p>
                    )}
            
                    {(author || readTime) && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
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