import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    output: 'standalone',  // QUAN TRỌNG: Tạo standalone build cho Docker
    compress: true,
    reactStrictMode: true,
    
    // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        domains: [],  // Thêm domain nếu cần load ảnh từ external
    },
    
    // Security headers (sẽ được Nginx xử lý, nhưng thêm cho chắc)
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    }
                ]
            }
        ]
    }
};

export default nextConfig;
