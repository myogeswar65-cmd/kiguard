/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Allow Vercel deployment
  output: 'standalone',
};

module.exports = nextConfig;
