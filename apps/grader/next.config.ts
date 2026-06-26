import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@atrium/application",
    "@atrium/domain",
    "@atrium/events",
    "@atrium/shared",
  ],
}

export default nextConfig
