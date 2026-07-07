import { getCategories, getProducts, getReels, getBanners } from "@/lib/api";
import HeroReel from "@/components/home/HeroReel";
import HomeBanner from "@/components/home/HomeBanner";
import FamilyGrid from "@/components/home/FamilyGrid";
import ShoeSections from "@/components/home/ShoeSections";
import NewArrivals from "@/components/home/NewArrivals";
import ReelWall from "@/components/home/ReelWall";
import Testimonials from "@/components/home/Testimonials";
import WholesaleBanner from "@/components/home/WholesaleBanner";
import Reassurance from "@/components/home/Reassurance";

// Page rendue côté serveur avec revalidation incrémentale (ISR) pour le SEO.
export const revalidate = 600;

export const metadata = {
  title: "Tchokos SARL — Chaussures & accessoires à Douala",
  description:
    "Chaussures, sacs, ceintures et montres à Akwa, Douala. Commande sur WhatsApp, paiement Orange Money & MTN MoMo. Tarifs détail et grossiste.",
};

/**
 * Récupère 4 nouveautés : produits marqués « nouveau », avec repli sur les plus
 * récents si aucun produit n'est explicitement marqué.
 */
async function fetchNewArrivals() {
  const flagged = await getProducts({ is_new: true, per_page: 4 });
  if (flagged.items.length > 0) return flagged.items;

  const latest = await getProducts({ sort: "newest", per_page: 4 });
  return latest.items;
}

export default async function Home() {
  const [categories, newArrivals, reels, banners] = await Promise.all([
    getCategories(),
    fetchNewArrivals(),
    getReels(),
    getBanners(),
  ]);

  const families = categories.filter((category) => category.type === "family");
  const chaussures = families.find((family) => family.slug === "chaussures");

  return (
    <>
      <HeroReel
        reel={reels[0] ?? null}
        title="L'élégance en cuir, à portée de main"
        slogan="« C'est difficile, mais possible »"
      />

      <HomeBanner banners={banners} />

      <FamilyGrid families={families} />

      <ShoeSections chaussures={chaussures} />

      <NewArrivals products={newArrivals} />

      {/* Mur de reels : 2 rangées + lien vers /videos */}
      <ReelWall reels={reels} preview />

      <Testimonials />

      <WholesaleBanner />

      <Reassurance />
    </>
  );
}
