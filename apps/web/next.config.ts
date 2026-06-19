import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@atrium/ui", "@atrium/shared", "@atrium/domain"],
}

export default nextConfig
