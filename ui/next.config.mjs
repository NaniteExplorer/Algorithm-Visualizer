/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js ships untranspiled ESM addons; let Next transpile them.
  transpilePackages: ['three'],
};

export default nextConfig;
