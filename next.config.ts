import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'okkyckpfoupzqmqridqs.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "placeholder-org",
  project: "placeholder-project",
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
});
