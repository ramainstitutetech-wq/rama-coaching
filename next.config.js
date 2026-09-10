/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress responses
  compress: true,

  // Allow external images used across the site
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lakshaygroupedu.co.in" },
      { protocol: "https", hostname: "gyanxp.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "www.uxdt.nic.in" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
