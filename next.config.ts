import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    remotePatterns:[
      {
        protocol:"https",
      hostname:"placehold.co",
      pathname:"/**"
      }
    ]
  }
  /* config options here */
};

export default nextConfig;
