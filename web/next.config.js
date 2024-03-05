// Get Danswer Web Version
const { version: package_version } = require("./package.json"); // version from package.json
const env_version = process.env.DANSWER_VERSION; // version from env variable
// Use env version if set & valid, otherwise default to package version
const version = env_version || package_version;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.builder.io",
      },
    ],
    dangerouslyAllowSVG: true,
  },
  reactStrictMode: false,
  rewrites: async () => {
    // In production, something else (nginx in the one box setup) should take
    // care of this rewrite. TODO (chris): better support setups where
    // web_server and api_server are on different machines.
    if (process.env.NODE_ENV === "production")
      return {
        fallback: [
          {
            source: "/:path*",
            destination: `${process.env.NEXT_PUBLIC_INTERNAL_URL || ""}/:path*`, // Proxy to Backend
          },
        ],
      };

    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_INTERNAL_URL || ""}/:path*`, // Proxy to Backend
        },
        {
          source: "/:path*",
          destination: `${process.env.NEXT_PUBLIC_INTERNAL_URL || ""}/:path*`, // Proxy to Backend
        },
      ],
    };
  },
  redirects: async () => {
    // In production, something else (nginx in the one box setup) should take
    // care of this redirect. TODO (chris): better support setups where
    // web_server and api_server are on different machines.
    const defaultRedirects = [
      {
        source: "/",
        destination: "/dashboard/chat",
        permanent: true,
      },
    ];

    if (process.env.NODE_ENV === "production") return defaultRedirects;

    return defaultRedirects;
  },
  publicRuntimeConfig: {
    version,
  },
};

module.exports = nextConfig;
