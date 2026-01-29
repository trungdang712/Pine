import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Image optimization configuration
  images: {
    // Configure allowed image domains (add your domains here)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Optimize image formats
    formats: ["image/avif", "image/webp"],
  },

  // Experimental features for performance
  experimental: {
    // Enable optimized package imports for commonly used libraries
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },
};

// Conditionally enable bundle analyzer
const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? require("@next/bundle-analyzer")({ enabled: true })
    : (config: NextConfig) => config;

export default withBundleAnalyzer(nextConfig);
