import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Disabled for dynamic routes support
  output: "standalone", // Enable standalone mode for Docker deployment
};

export default nextConfig;
