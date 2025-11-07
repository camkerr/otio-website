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
