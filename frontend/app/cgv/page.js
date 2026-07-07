import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata = {
  title: "Conditions Générales de Vente — Tchokos SARL",
  description: "CGV de Tchokos SARL : modalités de commande, paiement, livraison et garanties applicables aux achats sur la boutique en ligne.",
};

const LAST_UPDATE = "1er juin 2026";

export default function CGVPage() {
  return (
    <Container className="py-12 sm:py-20">
      <article className="prose-tchokos mx-auto max-w-3xl">
        <PageHeader
          title="Conditions Générales de Vente"
          subtitle={`Dernière mise à jour : ${LAST_UPDATE}`}
        />

        <Section title="1. Objet et champ d'application">
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les
            relations contractuelles entre <strong>Tchokos SARL</strong>,
            grossiste-détaillant de chaussures et accessoires, dont le siège est
            situé au quartier Akwa, Douala, Cameroun (ci-après «&nbsp;le
            Vendeur&nbsp;»), et toute personne physique ou morale souhaitant
            effectuer un achat via le site internet ou via WhatsApp
            (ci-après «&nbsp;le Client&nbsp;»).
          </p>
          <p>
            Toute commande passée implique l'acceptation sans réserve des
            présentes CGV. Le Vendeur se réserve le droit de les modifier à
            tout moment ; les CGV applicables sont celles en vigueur à la date
            de la commande.
          </p>
        </Section>

        <Section title="2. Produits">
          <p>
            Les produits proposés à la vente sont présentés avec la plus grande
            exactitude possible. Les photographies et vidéos sont non
            contractuelles et peuvent légèrement différer des produits réels
            (rendu écran, colorimétrie). Tchokos SARL s'engage à informer le
            Client de toute indisponibilité d'un article après passation de la
            commande.
          </p>
          <p>
            Les prix sont indiqués en Francs CFA (XAF) toutes taxes comprises.
            Ils sont susceptibles d'être modifiés à tout moment, sans préavis,
            mais n'affectent pas les commandes déjà confirmées.
          </p>
        </Section>

        <Section title="3. Commande">
          <p>
            La commande peut être passée :
          </p>
          <ul>
            <li>Via le site internet (ajout au panier + validation)&nbsp;;</li>
            <li>Via WhatsApp au <strong>+237 688 09 47 67</strong>&nbsp;;</li>
            <li>Par e-mail à <strong>contact@tchokos.cm</strong>.</li>
          </ul>
          <p>
            La commande n'est définitivement acceptée qu'après confirmation
            écrite du Vendeur et réception du paiement ou d'une preuve de
            paiement valide.
          </p>
        </Section>

        <Section title="4. Prix et paiement">
          <p>Les moyens de paiement acceptés sont :</p>
          <ul>
            <li><strong>Orange Money</strong> — virement vers le numéro marchand communiqué lors de la commande&nbsp;;</li>
            <li><strong>MTN Mobile Money (MoMo)</strong> — même modalité&nbsp;;</li>
            <li><strong>Espèces</strong> — uniquement en boutique, au quartier Akwa, Douala.</li>
          </ul>
          <p>
            Le Client s'engage à envoyer la preuve de paiement (capture d'écran
            ou notification) au Vendeur après tout virement. La validation du
            paiement est effectuée exclusivement côté Vendeur, dans un délai
            maximum de 24 heures ouvrées.
          </p>
        </Section>

        <Section title="5. Livraison">
          <p>
            Tchokos SARL assure la livraison dans la ville de Douala et dans les
            principales villes du Cameroun via des prestataires partenaires.
          </p>
          <ul>
            <li><strong>Douala :</strong> 24 à 48 heures ouvrées après confirmation du paiement.</li>
            <li><strong>Autres villes :</strong> 3 à 7 jours ouvrés selon la destination.</li>
            <li><strong>Frais de livraison :</strong> calculés selon le poids, le volume et la destination, communiqués avant confirmation de la commande.</li>
          </ul>
          <p>
            Les délais indiqués sont donnés à titre indicatif. Tchokos SARL ne
            peut être tenu responsable des retards imputables aux transporteurs ou
            à des événements de force majeure.
          </p>
        </Section>

        <Section title="6. Droit de rétractation et retours">
          <p>
            Conformément à notre <Link href="/retours" className="text-cognac underline-offset-2 hover:underline">politique de retours</Link>,
            le Client dispose d'un délai de <strong>7 jours</strong> à compter de
            la réception pour signaler un défaut de conformité ou un vice apparent.
            Passé ce délai, aucune réclamation ne sera acceptée pour ces motifs.
          </p>
          <p>
            Les articles retournés doivent être dans leur état d'origine, non
            portés, non lavés, accompagnés de tous leurs accessoires et emballages.
          </p>
        </Section>

        <Section title="7. Garanties">
          <p>
            Les produits bénéficient de la garantie légale de conformité. En
            cas de défaut de fabrication avéré constaté dans les 30 jours suivant
            la livraison, Tchokos SARL s'engage à procéder à l'échange ou au
            remboursement du produit concerné.
          </p>
        </Section>

        <Section title="8. Responsabilité">
          <p>
            Tchokos SARL ne saurait être tenu responsable des dommages indirects
            résultant de l'utilisation des produits vendus, ni de tout préjudice
            lié à un usage non conforme à leur destination.
          </p>
        </Section>

        <Section title="9. Protection des données">
          <p>
            Les informations collectées lors des commandes sont traitées
            conformément à notre{" "}
            <Link href="/confidentialite" className="text-cognac underline-offset-2 hover:underline">
              Politique de confidentialité
            </Link>
            . Elles ne sont jamais cédées à des tiers à des fins commerciales.
          </p>
        </Section>

        <Section title="10. Litiges et droit applicable">
          <p>
            Les présentes CGV sont soumises au droit camerounais. En cas de
            litige, les parties s'engagent à rechercher une solution amiable
            avant tout recours judiciaire. À défaut d'accord amiable, les
            tribunaux compétents de Douala seront seuls compétents.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Pour toute question relative aux présentes CGV :{" "}
            <a href="mailto:contact@tchokos.cm" className="text-cognac underline-offset-2 hover:underline">
              contact@tchokos.cm
            </a>{" "}
            ou via notre{" "}
            <Link href="/contact" className="text-cognac underline-offset-2 hover:underline">
              page Contact
            </Link>
            .
          </p>
        </Section>
      </article>
    </Container>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-10 border-b border-sand pb-8">
      <h1 className="font-display text-3xl font-bold text-espresso sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 font-body text-sm text-taupe">{subtitle}</p>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 font-display text-xl font-semibold text-espresso">{title}</h2>
      <div className="space-y-3 font-body text-sm leading-relaxed text-taupe [&_a]:text-cognac [&_strong]:text-espresso [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
