import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "shop.nalalifeline.org" },
      { protocol: "https", hostname: "nalalifeline.org" },
      { protocol: "https", hostname: "**.exactdn.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
    ],
  },
};

export default nextConfig;