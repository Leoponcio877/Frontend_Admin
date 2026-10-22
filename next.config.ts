import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 1. Elimina la cabecera X-Powered-By (CWE-497)
  poweredByHeader: false,

  async headers() {
    return [
      {
        // 2. Aplica a todas las rutas
        source: '/(.*)',
        headers: [
          {
            // Corrige Clickjacking (CWE-1021)
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Corrige MIME-Sniffing (CWE-693)
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Corrige HSTS (CWE-319) - Solo efectivo en HTTPS
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // Corrige Content Security Policy (CWE-693)
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;