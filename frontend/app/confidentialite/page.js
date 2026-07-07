import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata = {
  title: "Politique de confidentialité — Tchokos SARL",
  description:
    "Politique de confidentialité de Tchokos SARL : collecte, traitement et protection de vos données personnelles.",
};

const LAST_UPDATE = "1er juin 2026";

export default function ConfidentialitePage() {
  return (
    <Container className="py-12 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <div className="mb-10 border-b border-sand pb-8">
          <h1 className="font-display text-3xl font-bold text-espresso sm:text-4xl">
            Politique de confidentialité
          </h1>
          <p className="mt-2 font-body text-sm text-taupe">
            Dernière mise à jour : {LAST_UPDATE}
          </p>
        </div>

        <div className="space-y-8 font-body text-sm leading-relaxed text-taupe [&_a]:text-cognac [&_a]:underline-offset-2 [&_a:hover]:underline [&_strong]:text-espresso [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">

          <Section title="1. Responsable du traitement">
            <p>
              <strong>Tchokos SARL</strong>, dont le siège social est situé au
              quartier Akwa, Douala, Cameroun, est responsable du traitement de
              vos données personnelles collectées via ce site et via ses canaux
              de communication (WhatsApp, e-mail, Facebook).
            </p>
            <p>Contact DPO : <a href="mailto:contact@tchokos.cm">contact@tchokos.cm</a></p>
          </Section>

          <Section title="2. Données collectées">
            <p>Nous collectons les données suivantes :</p>
            <ul>
              <li><strong>Données d'identification :</strong> nom, prénom, adresse de livraison, numéro de téléphone, adresse e-mail.</li>
              <li><strong>Données de transaction :</strong> référence de commande, articles achetés, montant, mode de paiement.</li>
              <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées (via cookies techniques uniquement).</li>
              <li><strong>Données de communication :</strong> messages échangés sur WhatsApp ou par e-mail dans le cadre du service client.</li>
            </ul>
          </Section>

          <Section title="3. Finalités du traitement">
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            <ul>
              <li>Traitement et suivi de vos commandes.</li>
              <li>Gestion du service client et des retours.</li>
              <li>Envoi de notifications push liées à vos commandes (uniquement si vous y avez consenti).</li>
              <li>Gestion des comptes clients et des comptes grossiste.</li>
              <li>Amélioration de nos services et de notre site internet.</li>
              <li>Respect de nos obligations légales et comptables.</li>
            </ul>
          </Section>

          <Section title="4. Base légale du traitement">
            <p>
              Le traitement de vos données repose sur les bases légales suivantes :
            </p>
            <ul>
              <li><strong>Exécution du contrat :</strong> traitement des commandes, livraison, facturation.</li>
              <li><strong>Consentement :</strong> envoi de notifications push, communications marketing.</li>
              <li><strong>Intérêt légitime :</strong> amélioration de nos services, sécurité du site.</li>
              <li><strong>Obligation légale :</strong> conservation des données comptables et fiscales.</li>
            </ul>
          </Section>

          <Section title="5. Durée de conservation">
            <ul>
              <li><strong>Données de commande :</strong> 10 ans à compter de la transaction (obligation comptable).</li>
              <li><strong>Données de compte client :</strong> durée de vie du compte + 3 ans après sa clôture.</li>
              <li><strong>Cookies techniques :</strong> session ou 13 mois maximum.</li>
              <li><strong>Communications WhatsApp / e-mail :</strong> 3 ans à compter du dernier contact.</li>
            </ul>
          </Section>

          <Section title="6. Partage des données">
            <p>
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être
              transmises aux catégories de destinataires suivantes :
            </p>
            <ul>
              <li><strong>Prestataires de livraison</strong> (nom, adresse, téléphone) pour la remise du colis.</li>
              <li><strong>Opérateurs de paiement mobile</strong> (Orange Money, MTN MoMo) dans le cadre de la transaction.</li>
              <li><strong>Hébergeurs et prestataires techniques</strong> intervenant dans le fonctionnement du site.</li>
              <li><strong>Autorités compétentes</strong> sur réquisition judiciaire.</li>
            </ul>
          </Section>

          <Section title="7. Vos droits">
            <p>
              Conformément à la législation en vigueur, vous disposez des droits suivants :
            </p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données.</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes.</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données.</li>
              <li><strong>Droit à la limitation :</strong> suspendre le traitement de vos données.</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format lisible.</li>
              <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements.</li>
              <li><strong>Retrait du consentement :</strong> à tout moment pour les traitements basés sur le consentement.</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:contact@tchokos.cm">contact@tchokos.cm</a> ou via
              notre <Link href="/contact">page Contact</Link>.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              Notre site utilise uniquement des cookies techniques strictement
              nécessaires au fonctionnement (session, panier, authentification).
              Aucun cookie de tracking publicitaire ou analytique tiers n'est
              utilisé sans votre consentement explicite.
            </p>
          </Section>

          <Section title="9. Sécurité">
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles
              adaptées pour protéger vos données contre tout accès non autorisé,
              perte ou divulgation : connexions chiffrées (HTTPS), accès
              restreint aux données, stockage sécurisé des jetons d'authentification.
            </p>
          </Section>

          <Section title="10. Modifications">
            <p>
              Cette politique peut être mise à jour. Toute modification
              substantielle sera notifiée par e-mail ou par un bandeau sur le
              site. La version en vigueur est toujours accessible à l'adresse{" "}
              <Link href="/confidentialite">/confidentialite</Link>.
            </p>
          </Section>
        </div>
      </article>
    </Container>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-semibold text-espresso">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
