"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayIcon, WhatsAppIcon } from "@/components/icons";
import { mediaUrl } from "@/lib/media";
import { buildWhatsAppLink, buildReelMessage } from "@/lib/whatsapp";

/**
 * Carte d'un reel : vignette portrait cliquable vers la fiche produit +
 * bouton « Je veux ce modèle » qui ouvre WhatsApp avec le contexte du reel.
 * Composant client pour pouvoir appeler stopPropagation sur le bouton WhatsApp.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Reel} props.reel
 */
export default function ReelCard({ reel }) {
  const href = reel.product ? `/produit/${reel.product.slug}` : "/boutique";
  const poster = mediaUrl(reel.poster_url);
  const waHref = buildWhatsAppLink(buildReelMessage(reel));

  return (
    <div className="group relative aspect-[9/16] overflow-hidden rounded-card bg-taupe/30">
      {/* Image de fond */}
      <Image
        src={poster}
        alt={reel.product?.name ?? "Reel Tchokos"}
        fill
        sizes="(min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Voile dégradé */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/10 to-transparent"
      />

      {/* Zone cliquable vers le produit (hors bande basse) */}
      <Link
        href={href}
        aria-label={reel.product?.name ? `Voir ${reel.product.name}` : "Voir le produit"}
        className="absolute inset-x-0 top-0 z-10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-camel"
        style={{ bottom: "88px" }}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cream/90 text-espresso transition-transform group-hover:scale-110">
          <PlayIcon className="h-5 w-5 translate-x-0.5" />
        </span>
      </Link>

      {/* Bande basse : nom produit + bouton WhatsApp */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        {reel.product?.name && (
          <p className="line-clamp-1 font-body text-sm font-medium text-cream">
            {reel.product.name}
          </p>
        )}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-button border border-cream/30 bg-cream/10 px-3 py-2 font-body text-xs font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-cream hover:text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Je veux ce modèle
        </a>
      </div>
    </div>
  );
}
