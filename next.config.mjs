/** @type {import('next').NextConfig} */
const cmsAdminBaseUrl = process.env.CMS_ADMIN_URL?.replace(/\/$/, '');
const cmsAdminDestination = cmsAdminBaseUrl
  ? `${cmsAdminBaseUrl}/admin`
  : '/admin/index.html';

const nextConfig = {
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/blogs.html', destination: '/blogs', permanent: true },
      { source: '/article.html', destination: '/blogs', permanent: true },
      { source: '/admin', destination: cmsAdminDestination, permanent: false },
      { source: '/admin/', destination: cmsAdminDestination, permanent: false },
    ];
  },
};

export default nextConfig;
