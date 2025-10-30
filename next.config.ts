// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // ← Ignore ALL TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true,  // ← Ignore ESLint too
  },
};

module.exports = nextConfig;