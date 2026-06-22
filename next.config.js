module.exports = {
  eslint: {
    // Lint runs in CI separately; don't block production Docker builds
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/packages/:path*.apk",
        headers: [
          {
            key: "Content-Type",
            value: "application/vnd.android.package-archive",
          },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="rudra-app.apk"',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  output: "standalone",
};
