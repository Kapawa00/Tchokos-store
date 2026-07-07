import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { mediaUrl } from "@/lib/media";

/**
 * Bannière(s) promotionnelles de l'accueil, gérées depuis le back-office
 * (Filament → Accueil → Bannières). Chaque bannière est une image pleine
 * largeur avec titre/sous-titre, optionnellement cliquable.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Banner[]} props.banners
 */
export default function HomeBanner({ banners }) {
  if (!banners || banners.length === 0) return null;

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-col gap-6">
        {banners.map((banner) => {
          const content = (
            <div className="relative h-40 overflow-hidden rounded-card bg-espresso sm:h-56 lg:h-64">
              <Image
                src={mediaUrl(banner.image_url)}
                alt={banner.title}
                fill
                priority
                className="object-cover opacity-70"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent"
              />
              <div className="relative flex h-full flex-col items-start justify-end p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="mt-1 max-w-md font-body text-sm text-cream/85">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </div>
          );

          return banner.link_url ? (
            <Link key={banner.id} href={banner.link_url} className="block">
              {content}
            </Link>
          ) : (
            <div key={banner.id}>{content}</div>
          );
        })}
      </div>
    </Container>
  );
}
