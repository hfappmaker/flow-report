const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const { withBotId } = require("botid/next/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,

  // Turbopack configuration (Next.js 16+)
  // Turbopack handles file watching and optimization automatically
  turbopack: {},

  // Keep webpack config for backward compatibility when using --webpack flag
  webpack: (config, context) => {
    // Enable polling based on env variable being set
    if (process.env.NEXT_WEBPACK_USEPOLLING) {
      config.watchOptions = {
        poll: 500,
        aggregateTimeout: 300,
      };
    }

    // Optimize chunks
    if (process.env.VERCEL_ENV === "production") {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(withBotId(nextConfig));
