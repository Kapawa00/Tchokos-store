import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata = {
  title: "Mentions légales — Tchokos SARL",
  description: "Mentions légales de Tchokos SARL : éditeur, hébergeur, propriété intellectuelle.",
};

export default function MentionsLegalesPage() {
  return (
    <Container className="py-12 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <div className="mb-10 border-b border-sand pb-8">
          <h1 className="font-display text-3xl font-bold text-espresso sm:text-4xl">
            Mentions légales
          </h1>
        </div>

        <div className="space-y-8 font-body text-sm leading-relaxed text-taupe [&_strong]:text-espresso">
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
              Éditeur du site
            </h2>
            <div className="space-y-1">
              <p><strong>Dénomination sociale :</strong> Tchokos SARL</p>
              <p><strong>Forme juridique :</strong> Société à Responsabilité Limitée (SARL)</p>
              <p><strong>Siège social :</strong> Quartier Akwa, Douala, Cameroun</p>
              <p><strong>Activité :</strong> Grossiste-détaillant de chaussures et accessoires</p>
              <p>
                <strong>Contact :</strong>{" "}
                <a href="mailto:contact@tchokos.cm" className="text-cognac underline-offset-2 hover:underline">
                  contact@tchokos.cm
                </a>{" "}
                — WhatsApp +237 688 09 47 67
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
              Hébergement
            </h2>
            <p>
              Le site est hébergé par un prestataire technique dont les coordonnées
              sont disponibles sur demande à{" "}
              <a href="mailto:contact@tchokos.cm" className="text-cognac underline-offset-2 hover:underline">
                contact@tchokos.cm
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
              Propriété intellectuelle
            </h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, logos,
              graphismes) est la propriété exclusive de Tchokos SARL ou de ses
              partenaires, et est protégé par les lois relatives à la propriété
              intellectuelle. Toute reproduction, même partielle, est interdite
              sans autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
              Données personnelles
            </h2>
            <p>
              Le traitement de vos données personnelles est décrit dans notre{" "}
              <Link href="/confidentialite" className="text-cognac underline-offset-2 hover:underline">
                Politique de confidentialité
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
              Conditions générales de vente
            </h2>
            <p>
              Les conditions applicables aux transactions sont accessibles via
              nos{" "}
              <Link href="/cgv" className="text-cognac underline-offset-2 hover:underline">
                CGV
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
              Limitation de responsabilité
            </h2>
            <p>
              Tchokos SARL s'efforce de maintenir les informations de ce site à
              jour et exactes, mais ne saurait être tenu responsable d'éventuelles
              erreurs ou omissions. Les liens vers des sites tiers n'engagent pas
              la responsabilité de Tchokos SARL quant à leur contenu.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-espresso">
              Droit applicable
            </h2>
            <p>
              Le site et ses contenus sont soumis au droit camerounais. Les
              tribunaux compétents de Douala sont seuls compétents en cas de litige.
            </p>
          </section>
        </div>
      </article>
    </Container>
  );
}
