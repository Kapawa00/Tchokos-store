import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { ServiceWorkerRegistrar, InstallPrompt } from "@/components/pwa";
import { CartProvider } from "@/components/cart/CartProvider";
import { getCategories } from "@/lib/api";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata = {
  applicationName: "Tchokos SARL",
  title: "Tchokos SARL",
  description: "Boutique en ligne Tchokos SARL — chaussures, sacs, ceintures et montres.",
  // Le <link rel="manifest"> est injecté automatiquement grâce à app/manifest.js.
  // Métadonnées iOS pour un rendu « application » (barre d'état, titre écran d'accueil).
  appleWebApp: {
    capable: true,
    title: "Tchokos",
    statusBarStyle: "default",
  },
};

// Couleur du chrome navigateur / barre d'état (theme-color) selon le thème système.
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F1E9" }, // cream
    { media: "(prefers-color-scheme: dark)", color: "#2A211B" }, // espresso
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }) {
  // Catégories chargées côté serveur (SSR/SEO) et transmises à l'en-tête.
  const categories = await getCategories();

  return (
    <html
      lang="fr"
      className={`${playfairDisplay.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-espresso font-body">
        {/* Lien d'évitement pour l'accessibilité au clavier */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-button focus:bg-espresso focus:px-4 focus:py-2 focus:text-cream"
        >
          Aller au contenu
        </a>

        <CartProvider>
          <SiteChrome categories={categories}>
            <main id="contenu" className="flex-1">
              {children}
            </main>
          </SiteChrome>
          <InstallPrompt />
        </CartProvider>

        {/* Enregistrement global du Service Worker (cache léger + push) */}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
