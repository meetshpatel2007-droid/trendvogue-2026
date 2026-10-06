/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // ── Monorepo NFT tracing: lets Vercel bundle files from outside frontend/
  outputFileTracingRoot: path.join(__dirname, "../"),

  // ── Prevent webpack from bundling native Node.js modules ─────────────────
  // bcryptjs uses native crypto bindings; Prisma client has binary engines.
  // Without this, Vercel's serverless build throws "Module not found" errors.
  serverExternalPackages: ["bcryptjs", "@prisma/client", "prisma"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  experimental: {
    serverActions: {
      // Allow Server Actions from Vercel preview/production domains + local dev
      allowedOrigins: [
        "localhost:3000",
        "*.vercel.app",
      ],
    },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@backend": path.join(__dirname, "../backend/src"),
    };
    return config;
  },
};

module.exports = nextConfig;
