// Manifeste PWA (Web App Manifest) — servi par Next à /manifest.webmanifest,
// avec la balise <link rel="manifest"> injectée automatiquement dans le <head>.
// Rend la boutique installable (« ajouter à l'écran d'accueil ») avec les
// couleurs de la charte « Cuir & Crème ».
// Doc : node_modules/next/dist/docs/.../metadata/manifest.md

/** @returns {import("next").MetadataRoute.Manifest} */
export default function manifest() {
  return {
    name: "Tchokos SARL",
    short_name: "Tchokos",
    description:
      "Boutique Tchokos SARL — chaussures, sacs, ceintures et montres à Douala. C'est difficile, mais possible.",
    lang: "fr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F6F1E9", // cream — écran de démarrage
    theme_color: "#2A211B", // espresso — barre d'état / chrome
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Raccourcis (appui long sur l'icône installée).
    shortcuts: [
      {
        name: "Boutique",
        short_name: "Boutique",
        url: "/boutique",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Mon panier",
        short_name: "Panier",
        url: "/panier",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
