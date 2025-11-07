/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        'remark-gfm',
        'remark-breaks',
        'rehype-raw',
        'rehype-slug',
        'rehype-autolink-headings',
        'mdast-util-gfm',
        'mdast-util-to-markdown',
        'micromark-extension-gfm',
        'unified',
        'remark',
        'remark-parse',
    ],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cezanne.studio',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: '*.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'logo.clearbit.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp'
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin'
                    }
                ]
            }
        ]
    }
};
export default nextConfig;
