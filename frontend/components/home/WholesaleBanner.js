import Link from "next/link";
import Container from "@/components/ui/Container";

/**
 * Bandeau « Vente en gros » : bloc espresso avec accroche grossiste et bouton
 * crème vers les tarifs grossistes.
 */
export default function WholesaleBanner() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="flex flex-col items-start gap-6 rounded-card bg-espresso p-8 text-cream sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-camel">
            Vente en gros
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Vous achetez en quantité ?
          </h2>
          <p className="mt-2 text-sm text-cream/80">
            Bénéficiez de nos tarifs grossistes sur les chaussures et accessoires.
            Créez un compte grossiste et accédez à des prix dédiés.
          </p>
        </div>
        <Link
          href="/vente-en-gros"
          className="inline-flex shrink-0 items-center justify-center rounded-button bg-cream px-7 py-3.5 font-body font-medium text-espresso transition-colors hover:bg-camel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-espresso"
        >
          Tarifs grossistes
        </Link>
      </div>
    </Container>
  );
}
