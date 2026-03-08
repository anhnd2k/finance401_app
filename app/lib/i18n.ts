import type { Locale } from './locale';

const translations = {
    vi: {
        // Navigation
        allPosts: 'Tất cả bài viết',
        about: 'Giới thiệu',
        // Homepage
        latestPosts: 'Bài viết mới nhất',
        latestPostsDesc: 'Khám phá thế giới tài chính',
        mostViewed: 'Xem nhiều nhất',
        mostViewedDesc: 'Những bài viết độc giả yêu thích',
        noPostsYet: 'Chưa có bài viết nào. Hãy quay lại sau!',
        // All Posts page
        allPostsTitle: 'Tất cả bài viết',
        postsFound: 'bài viết',
        noPostsFound: 'Không tìm thấy bài viết nào.',
        // Post detail
        relatedPosts: 'Bài viết liên quan',
        trendingThisMonth: 'Xu hướng tháng này',
        views: 'lượt xem',
        // Author page
        posts: 'bài viết',
        joinedOn: 'Tham gia',
        allPostsBy: 'Tất cả bài viết của',
        noPublishedPosts: 'Chưa có bài viết nào được đăng.',
        // Search
        searchPlaceholder: 'Tìm kiếm bài viết theo tiêu đề hoặc tag…',
        searching: 'Đang tìm kiếm…',
        noResults: 'Không tìm thấy kết quả.',
    },
    en: {
        // Navigation
        allPosts: 'All Posts',
        about: 'About',
        // Homepage
        latestPosts: 'Latest Posts',
        latestPostsDesc: 'Fresh insights from the world of Finance',
        mostViewed: 'Most Viewed',
        mostViewedDesc: 'Top posts our readers love',
        noPostsYet: 'No posts published yet. Check back soon!',
        // All Posts page
        allPostsTitle: 'All Posts',
        postsFound: 'posts',
        noPostsFound: 'No posts found.',
        // Post detail
        relatedPosts: 'Related Posts',
        trendingThisMonth: 'Trending This Month',
        views: 'views',
        // Author page
        posts: 'posts',
        joinedOn: 'Joined',
        allPostsBy: 'All Posts by',
        noPublishedPosts: 'No published posts yet.',
        // Search
        searchPlaceholder: 'Search posts by title or tag…',
        searching: 'Searching…',
        noResults: 'No results found.',
    },
} as const;

export type Translations = typeof translations.en;

export function getT(locale: Locale): Translations {
    return translations[locale];
}
