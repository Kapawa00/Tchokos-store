"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { mediaUrl, IMAGE_FALLBACK } from "@/lib/media";
import { PlayIcon } from "@/components/icons";

/**
 * Galerie de médias produit.
 * - Vidéos en première position (avec controls natifs), puis images 4:5.
 * - Desktop : colonne de vignettes à gauche + grand média à droite.
 * - Mobile : grand média en haut + défilement horizontal de vignettes en bas.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Media[]} props.media
 * @param {string} props.productName
 */
export default function ProductGallery({ media, productName }) {
  // Vidéos d'abord (position=0 implicite), puis images, triées par position.
  const sorted = [...media].sort((a, b) => {
    if (a.type !== b.type) return a.type === "video" ? -1 : 1;
    return (a.position ?? 0) - (b.position ?? 0);
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef(null);

  const active = sorted[activeIndex] ?? null;

  // Recharger la vidéo quand on change de média actif.
  useEffect(() => {
    if (videoRef.current) videoRef.current.load();
  }, [activeIndex]);

  // Aucun média : afficher le placeholder.
  if (sorted.length === 0) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-cream">
        <Image
          src={IMAGE_FALLBACK}
          alt={productName}
          fill
          priority
          className="object-cover"
        />
      </div>
    );
  }

  return (
    /*
     * Desktop : flex-row-reverse → [vignettes gauche | grand média droite]
     * Mobile  : flex-col          → [grand média haut | vignettes bas]
     */
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start">
      {/* ── Grand média principal ── */}
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-card bg-cream aspect-[4/5]">
        {active?.type === "video" ? (
          <video
            ref={videoRef}
            src={mediaUrl(active.url)}
            poster={active.poster_url ? mediaUrl(active.poster_url) : undefined}
            controls
            playsInline
            className="h-full w-full object-cover"
            aria-label={`Vidéo — ${productName}`}
          />
        ) : (
          <Image
            src={mediaUrl(active?.url, IMAGE_FALLBACK)}
            alt={`${productName}${activeIndex > 0 ? ` — vue ${activeIndex + 1}` : ""}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority={activeIndex === 0}
          />
        )}
      </div>

      {/* ── Vignettes (masquées si 1 seul média) ── */}
      {sorted.length > 1 && (
        <div
          role="list"
          aria-label="Vignettes galerie"
          className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 lg:pr-1"
          style={{ maxHeight: 480 }} // ~6 vignettes 72px + gaps
        >
          {sorted.map((m, i) => {
            const isActive = i === activeIndex;
            const thumb =
              m.type === "video"
                ? m.poster_url
                  ? mediaUrl(m.poster_url)
                  : IMAGE_FALLBACK
                : mediaUrl(m.url, IMAGE_FALLBACK);

            return (
              <button
                key={m.id}
                role="listitem"
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`${m.type === "video" ? "Vidéo" : "Image"} ${i + 1}`}
                aria-pressed={isActive}
                className={`relative shrink-0 overflow-hidden rounded-card border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac ${
                  isActive
                    ? "border-cognac opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ width: 60, height: 75 }} // rapport 4:5
              >
                <Image
                  src={thumb}
                  alt=""
                  fill
                  sizes="60px"
                  className="object-cover"
                />
                {m.type === "video" && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-espresso/40"
                  >
                    <PlayIcon className="h-4 w-4 text-cream" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
