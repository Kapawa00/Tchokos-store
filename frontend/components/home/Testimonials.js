import Container from "@/components/ui/Container";

/** @typedef {{ id: number, name: string, city: string, quote: string, stars: number, product?: string }} Testimonial */

/** @type {Testimonial[]} */
const TESTIMONIALS = [
  {
    id: 1,
    name: "Béatrice M.",
    city: "Akwa, Douala",
    quote:
      "J'ai commandé une paire via WhatsApp le matin, livrée l'après-midi ! La qualité est au rendez-vous, les semelles sont solides et le cuir est vraiment beau. Je recommande vivement.",
    stars: 5,
    product: "Escarpins cuir Noisette",
  },
  {
    id: 2,
    name: "Patrick N.",
    city: "Bonanjo, Douala",
    quote:
      "En tant que revendeur, les tarifs grossiste sont très intéressants et la livraison est rapide. Mon stock part en quelques jours à chaque fois. Partenaire fiable depuis deux ans.",
    stars: 5,
    product: "Lot Derbies Homme",
  },
  {
    id: 3,
    name: "Élise K.",
    city: "Deido, Douala",
    quote:
      "Les reels m'ont donné envie d'acheter le sac que j'avais vu. Exactement pareil en vrai, aucune mauvaise surprise. Le service client sur WhatsApp est très réactif.",
    stars: 5,
    product: "Sac bandoulière Cognac",
  },
];

/**
 * Étoiles SVG inline (performance, pas de dépendance externe).
 * @param {{ count: number }} props
 */
function Stars({ count }) {
  return (
    <span aria-label={`${count} étoiles sur 5`} className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill={i < count ? "currentColor" : "none"}
          stroke="currentColor"
          className={`h-4 w-4 ${i < count ? "text-brass" : "text-sand"}`}
        >
          <path
            strokeWidth="1.2"
            d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 1.9.7-4L2.2 5.7l4-.6z"
          />
        </svg>
      ))}
    </span>
  );
}

/**
 * Section témoignages clients : trois avis mis en avant sur la page d'accueil.
 */
export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-title" className="border-t border-sand bg-offwhite">
      <Container className="py-14 sm:py-20">
        <div className="mb-10 text-center">
          <h2 id="testimonials-title" className="font-display text-2xl font-semibold text-espresso sm:text-3xl">
            Ce que disent nos clients
          </h2>
          <p className="mt-1 text-sm text-taupe">
            Des milliers de clients satisfaits à Douala et au-delà
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-4 rounded-card border border-sand bg-cream p-6"
            >
              {/* Étoiles */}
              <Stars count={t.stars} />

              {/* Citation */}
              <blockquote className="flex-1">
                <p className="font-body text-sm leading-relaxed text-espresso">
                  &laquo;&nbsp;{t.quote}&nbsp;&raquo;
                </p>
              </blockquote>

              {/* Auteur */}
              <div className="flex items-center gap-3 border-t border-sand pt-4">
                {/* Avatar monogramme */}
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-espresso font-display text-sm font-semibold text-cream"
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-espresso">{t.name}</p>
                  <p className="font-body text-xs text-taupe">{t.city}</p>
                </div>
              </div>

              {/* Produit acheté */}
              {t.product && (
                <p className="font-body text-xs text-taupe/80">
                  ✓&nbsp;Achat vérifié — {t.product}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
