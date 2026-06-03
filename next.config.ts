import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack:{
    
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // // Keep firebase-admin and other Node.js-only packages out of the client bundle
  // serverExternalPackages: [
  //   "firebase-admin",
  //   "@google-cloud/firestore",
  //   "google-auth-library",
  //   "@polar-sh/sdk",
  // ],
};

export default nextConfig;
