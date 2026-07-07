import Link from "next/link";
import Container from "@/components/ui/Container";
import ReelCard from "./ReelCard";
import { ArrowRightIcon } from "@/components/icons";

// 2 rangées visibles sur la page d'accueil :
//   grille 3 colonnes (desktop) → 6 reels, grille 2 colonnes (mobile) → 6 reels = 3 rangées,
//   mais on privilégie le confort desktop. L'utilisateur peut tout voir sur /videos.
const HOME_LIMIT = 6;

/**
 * « Nos articles en vidéo » : mur de reels cliquables (grille 2→3 colonnes).
 * Deux modes :
 *   - preview (accueil) : 6 reels max + bouton « Voir plus » → /videos.
 *   - complet (page /videos) : tous les reels passés en props.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Reel[]} props.reels
 * @param {boolean} [props.preview] - true sur l'accueil, false sur la page dédiée
 */
export default function ReelWall({ reels, preview = false }) {
  if (!reels?.length) return null;

  const displayed = preview ? reels.slice(0, HOME_LIMIT) : reels;
  const hasMore = preview && reels.length > HOME_LIMIT;

  return (
    <section className="bg-espresso">
      <Container className="py-14 sm:py-20">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
              Nos articles en vidéo
            </h2>
            <p className="mt-1 text-sm text-cream/70">
              Découvrez nos pièces en mouvement
            </p>
          </div>
          {preview && (
            <Link
              href="/videos"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-camel transition-colors hover:text-cream focus-visible:outline-none focus-visible:underline"
            >
              Toutes les vidéos
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {displayed.map((reel) => (
            <li key={reel.id}>
              <ReelCard reel={reel} />
            </li>
          ))}
        </ul>

        {/* Bouton « Voir plus » centré sous la grille */}
        {hasMore && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 rounded-button border border-cream/30 bg-cream/10 px-8 py-3.5 font-body text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-cream hover:text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel"
            >
              Voir plus de vidéos
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
