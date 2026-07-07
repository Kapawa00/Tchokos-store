/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost", port: "8000" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "loremflickr.com" },
    ],
    dangerouslyAllowSVG: true,
    // Le backend Laravel tourne sur localhost:8000 en dev (cf. remotePatterns
    // ci-dessus) : Next.js 16 bloque par défaut l'optimiseur d'image pour toute
    // IP résolue en local/loopback (protection SSRF), ce qui casse toutes les
    // images produits/bannières en développement. Sans effet en production, où
    // le backend est exposé sur un vrai nom d'hôte.
    dangerouslyAllowLocalIP: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ── Proxy inverse vers le backend Laravel ────────────────────────────────────
  // Toutes les routes Filament (pages, Livewire, assets JS/CSS) sont transmises
  // au backend (port 8000) → l'admin reste sur le même port que le frontend.
  // En production, c'est nginx/Caddy qui joue ce rôle.
  async rewrites() {
    const backend = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")
      .replace(/\/api\/?$/, "");

    return {
      // beforeFiles : prioritaire sur le routage Next.js et les fichiers statiques.
      beforeFiles: [
        // Pages et actions Filament
        { source: "/admin",               destination: `${backend}/admin` },
        { source: "/admin/:path*",        destination: `${backend}/admin/:path*` },

        // Composants Livewire (XHR, uploads)
        { source: "/livewire/:path*",     destination: `${backend}/livewire/:path*` },

        // Assets Filament publiés dans public/filament/
        { source: "/filament/:path*",     destination: `${backend}/filament/:path*` },

        // Assets JS publiés dans public/js/filament/
        { source: "/js/filament/:path*",  destination: `${backend}/js/filament/:path*` },

        // Assets CSS publiés dans public/css/filament/
        { source: "/css/filament/:path*", destination: `${backend}/css/filament/:path*` },
      ],
    };
  },
};

export default nextConfig;
