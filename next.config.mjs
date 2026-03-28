/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/blogs.html', destination: '/blogs', permanent: true },
      { source: '/article.html', destination: '/blogs', permanent: true },
    ];
  },
};

export default nextConfig;
