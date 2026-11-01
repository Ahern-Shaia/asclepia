import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: {
    // The default, written out so it is visible: Server Actions (including the public inquiry form)
    // accept at most 1 MB. Image uploads use a Route Handler instead (stack-rules S8-3).
    serverActions: { bodySizeLimit: "1mb" },
  },
};

export default nextConfig;
