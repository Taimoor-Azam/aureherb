/**
 * Hostinger has no Vercel env. Fill live shop public values when unset.
 * Dashboard / process env still wins.
 */
const PRODUCTION_PUBLIC_ENV = {
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: "https://api.aureherb.com",
  NEXT_PUBLIC_DEFAULT_REGION: "pk",
  NEXT_PUBLIC_BASE_URL: "https://www.aureherb.com",
}

for (const [key, value] of Object.entries(PRODUCTION_PUBLIC_ENV)) {
  if (!process.env[key]) {
    process.env[key] = value
  }
}

const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "media.aureherb.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
