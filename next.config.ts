import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    compress: true,
    reactStrictMode: true,

    experimental: {
        serverMinification: false,
    },      

    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https', hostname: '**' 
            },
            {
                protocol: 'http',        // chưa có SSL dùng http
                hostname: '103.200.21.209',  // IP VPS
                pathname: '/uploads/**',
            },
            // {
            //     protocol: 'https',
            //     hostname: 'your-domain.com',
            //     pathname: '/uploads/**',
            // }
        ],
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
