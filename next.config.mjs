/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "*",

      },
      {
        protocol: 'https',
        hostname: "lh3.googleusercontent.com"
      }
    ],
  },
 
};

export default nextConfig;