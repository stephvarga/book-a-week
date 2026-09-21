/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // If you host gallery/hero photos externally instead of under /public,
  // add their hostname(s) here — see the images.remotePatterns docs:
  // https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Clickjacking protection: this site should never be framed.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stop browsers from MIME-sniffing responses into a different type.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak the full referring URL (which could include the path) to other origins.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // No use for camera/mic/geolocation/etc. on this site.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Force HTTPS for a year, including subdomains.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
