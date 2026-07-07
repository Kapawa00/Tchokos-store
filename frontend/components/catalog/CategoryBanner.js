import Image from "next/image";
import { mediaUrl } from "@/lib/media";

/**
 * Bannière de catégorie : fond image ou vidéo avec voile espresso progressif
 * et titre serif centré en bas. Adaptée aux familles et aux rayons.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Category|null} props.category - Catégorie active (famille ou rayon).
 * @param {import("@/lib/types").Category|null} [props.parent] - Famille parente si on est sur un rayon.
 */
export default function CategoryBanner({ category, parent }) {
  const bgVideo = category?.banner_video_url;
  const bgImage = category?.banner_image_url;

  return (
    <div className="relative h-48 overflow-hidden bg-espresso sm:h-64 lg:h-80">
      {bgVideo ? (
        <video
          src={mediaUrl(bgVideo)}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      ) : bgImage ? (
        <Image
          src={mediaUrl(bgImage)}
          alt=""
          fill
          priority
          className="object-cover opacity-50"
          aria-hidden="true"
        />
      ) : null}

      {/* Voile progressif pour garantir la lisibilité du titre */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/55 to-espresso/20"
      />

      <div className="relative flex h-full flex-col items-center justify-end px-4 pb-10 text-center sm:pb-14">
        {parent?.name && (
          <p className="mb-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-camel">
            {parent.name}
          </p>
        )}
        <h1 className="font-display text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
          {category?.name ?? "Boutique"}
        </h1>
        {category?.description && (
          <p className="mt-2 max-w-md font-body text-sm text-cream/75">
            {category.description}
          </p>
        )}
      </div>
    </div>
  );
}
