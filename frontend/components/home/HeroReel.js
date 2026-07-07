"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/icons";
import { mediaUrl } from "@/lib/media";

/**
 * Hero d'accueil : reel vidéo en boucle, muet, autoplay — avec poster affiché
 * immédiatement (premier rendu) et chargement de la vidéo différé pour ménager
 * le mobile (respect de `Save-Data`). Le texte reste lisible via un voile
 * dégradé. Dégrade proprement en simple visuel si la vidéo ne se charge pas.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Reel|null} [props.reel]
 * @param {string} props.title
 * @param {string} props.slogan
 * @param {string} [props.ctaHref]
 * @param {string} [props.ctaLabel]
 */
export default function HeroReel({
  reel,
  title,
  slogan,
  ctaHref = "/boutique",
  ctaLabel = "Découvrir la boutique",
}) {
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  const poster = reel?.poster_url ? mediaUrl(reel.poster_url) : null;
  const videoSrc = reel?.url ? mediaUrl(reel.url) : null;

  // Optimisation mobile : la vidéo n'est montée qu'après l'hydratation (le
  // poster est déjà peint) et jamais si l'utilisateur a activé « économie de
  // données ».
  useEffect(() => {
    if (!videoSrc) return;
    if (typeof navigator !== "undefined" && navigator.connection?.saveData) return;
    setShowVideo(true);
  }, [videoSrc]);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [showVideo]);

  return (
    <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden bg-espresso">
      {/* Poster (visuel immédiat). À défaut, dégradé « cuir & crème ». */}
      {poster ? (
        <Image
          src={poster}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-camel via-cognac to-espresso" />
      )}

      {/* Vidéo (chargée après coup, muette, en boucle). */}
      {showVideo && videoSrc && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          aria-hidden="true"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Voile dégradé pour le contraste du texte. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/45 to-espresso/20"
        aria-hidden="true"
      />

      <Container className="relative flex h-full flex-col items-start justify-end pb-14 sm:pb-20">
        <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl font-display text-lg italic text-cream/85 sm:text-xl">
          {slogan}
        </p>
        <Link
          href={ctaHref}
          className="mt-7 inline-flex items-center gap-2 rounded-button bg-cream px-7 py-3.5 font-body font-medium text-espresso transition-colors hover:bg-camel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-espresso"
        >
          {ctaLabel}
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </Container>
    </section>
  );
}
