/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // allow next/image to load images from Unsplash (and keep local/public working)
    domains: ["images.unsplash.com"],
    // If you prefer pattern-matching for different hosts/paths use `remotePatterns` instead:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'images.unsplash.com',
    //   },
    // ],
  },
};

export default nextConfig;
