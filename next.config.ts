import type { NextConfig } from "next";

// `npm run build:app` sets CAPACITOR_BUILD: a static export in ./out for the Android app.
// The website (Vercel) build stays a normal Next.js build with the service-worker headers.
const app = process.env.CAPACITOR_BUILD === "1";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  ...(app
    ? { output: "export" }
    : {
        async headers() {
          return [
            {
              source: "/sw.js",
              headers: [
                { key: "Content-Type", value: "application/javascript; charset=utf-8" },
                { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
                { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
