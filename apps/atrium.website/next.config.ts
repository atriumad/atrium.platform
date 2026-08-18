import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /process was a public URL before the page was removed, so anything already
  // pointing at it — search results, past emails, ads — would 404. /services
  // carries what that page described: the 28-day cycle and the growth engine.
  async redirects() {
    return [{ source: "/process", destination: "/services", permanent: true }]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.atriumad.com" },
    ],
  },
};

export default nextConfig;
