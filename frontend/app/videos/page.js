import { getReels } from "@/lib/api";
import ReelWall from "@/components/home/ReelWall";
import Container from "@/components/ui/Container";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export const revalidate = 600;

export const metadata = {
  title: "Nos vidéos — Tchokos SARL",
  description:
    "Découvrez toutes nos chaussures, sacs et accessoires en vidéo. Commandez directement sur WhatsApp.",
};

export default async function VideosPage() {
  const reels = await getReels();

  return (
    <>
      {/* En-tête de page */}
      <div className="bg-espresso pb-0 pt-14 sm:pt-20">
        <Container>
          {/* Fil d'Ariane */}
          <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center gap-2 font-body text-xs text-cream/50">
            <Link href="/" className="transition-colors hover:text-cream">Accueil</Link>
            <ArrowRightIcon className="h-3 w-3 shrink-0" />
            <span className="text-cream/80">Vidéos</span>
          </nav>

          <h1 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
            Nos articles en vidéo
          </h1>
          <p className="mt-2 text-sm text-cream/70">
            {reels.length > 0
              ? `${reels.length} vidéo${reels.length > 1 ? "s" : ""} — découvrez chaque pièce en mouvement`
              : "Revenez bientôt, nos vidéos arrivent."}
          </p>
        </Container>
      </div>

      {/* Grille complète */}
      {reels.length > 0 ? (
        <ReelWall reels={reels} preview={false} />
      ) : (
        /* État vide */
        <div className="bg-espresso">
          <Container className="pb-20 pt-10">
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="font-body text-cream/60">Aucune vidéo disponible pour l&apos;instant.</p>
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 rounded-button bg-cream px-7 py-3.5 font-body text-sm font-semibold text-espresso transition-colors hover:bg-camel"
              >
                Voir la boutique
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </div>
      )}

      {/* Appel à l'action bas de page */}
      {reels.length > 0 && (
        <div className="border-t border-sand bg-offwhite">
          <Container className="py-12 text-center">
            <p className="font-body text-sm text-taupe">
              Un article vous plaît ?{" "}
              <Link href="/boutique" className="font-semibold text-cognac underline-offset-2 hover:underline">
                Parcourez la boutique
              </Link>{" "}
              ou commandez directement sur{" "}
              <Link href="/panier" className="font-semibold text-cognac underline-offset-2 hover:underline">
                WhatsApp
              </Link>.
            </p>
          </Container>
        </div>
      )}
    </>
  );
}
