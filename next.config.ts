import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const sharedDirectives = [
  "default-src 'self'",
  `script-src 'self' blob: 'unsafe-inline' 'wasm-unsafe-eval'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/", headers: [...securityHeaders, { key: "Content-Security-Policy", value: `${sharedDirectives}; connect-src 'self'` }] },
      { source: "/model-lab", headers: [...securityHeaders, { key: "Content-Security-Policy", value: `${sharedDirectives}; connect-src 'self'` }] },
    ];
  },
};

export default nextConfig;
