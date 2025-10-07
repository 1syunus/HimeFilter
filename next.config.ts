import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
=======

>>>>>>> origin/main-new
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        port: "",
        pathname: "/images/anime/**"
      },
    ],
  },
};

export default nextConfig;
