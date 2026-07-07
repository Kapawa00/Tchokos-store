import Link from "next/link";
import { Container } from "@/components/ui";
import { whatsappUrl } from "@/lib/config";
import { WhatsAppIcon, CheckCircleIcon } from "@/components/icons";

export const metadata = {
  title: "Politique de retours & échanges — Tchokos SARL",
  description:
    "Politique de retours de Tchokos SARL : délais, conditions, procédure de retour et modalités d'échange ou de remboursement.",
};

const LAST_UPDATE = "1er juin 2026";

const STEPS = [
  {
    num: 1,
    title: "Nous contacter",
    desc: "Signalez votre retour sous 7 jours par WhatsApp ou e-mail en précisant votre référence de commande et la raison du retour.",
  },
  {
    num: 2,
    title: "Validation",
    desc: "Notre équipe étudie votre demande sous 24 heures ouvrées et vous communique l'accord ou les éléments nécessaires.",
  },
  {
    num: 3,
    title: "Renvoi du produit",
    desc: "Renvoyez l'article dans son emballage d'origine, accompagné du bon de commande. Les frais de retour sont à la charge du Client sauf en cas de défaut de fabrication.",
  },
  {
    num: 4,
    title: "Échange ou remboursement",
    desc: "À réception et vérification du produit, nous procédons à l'échange ou au remboursement sous 5 jours ouvrés via Orange Money ou MTN MoMo.",
  },
];

export default function RetoursPage() {
  return (
    <Container className="py-12 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <div className="mb-10 border-b border-sand pb-8">
          <h1 className="font-display text-3xl font-bold text-espresso sm:text-4xl">
            Retours &amp; échanges
          </h1>
          <p className="mt-2 font-body text-sm text-taupe">
            Dernière mise à jour : {LAST_UPDATE}
          </p>
        </div>

        {/* Engagement */}
        <div className="mb-10 rounded-card border border-sage/30 bg-sage/5 p-6">
          <p className="font-body text-sm leading-relaxed text-espresso">
            <strong>Notre engagement :</strong> Votre satisfaction est notre
            priorité. Si un article ne vous convient pas ou présente un défaut,
            nous ferons tout notre possible pour trouver une solution rapide et
            équitable.
          </p>
        </div>

        {/* Conditions */}
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl font-semibold text-espresso">
            Conditions de retour
          </h2>
          <div className="space-y-3 font-body text-sm leading-relaxed text-taupe">
            <p>
              Un retour est accepté si <strong className="text-espresso">toutes</strong> les
              conditions suivantes sont remplies :
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>La demande est faite dans les <strong className="text-espresso">7 jours</strong> suivant la réception de la commande.</li>
              <li>L'article est dans son état d'origine : non porté, non lavé, sans odeur.</li>
              <li>L'emballage d'origine est conservé (boîte, sac, etc.).</li>
              <li>Tous les accessoires inclus sont présents (lacets, housses, etc.).</li>
              <li>La référence de commande est fournie.</li>
            </ul>

            <p className="mt-4 font-semibold text-espresso">Cas non éligibles aux retours :</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Articles portés, endommagés ou modifiés par le Client.</li>
              <li>Articles soldés ou achetés en lot grossiste (sauf défaut de fabrication).</li>
              <li>Articles personnalisés sur demande.</li>
              <li>Délai de 7 jours dépassé, sauf défaut de fabrication prouvé.</li>
            </ul>
          </div>
        </section>

        {/* Procédure */}
        <section className="mb-10">
          <h2 className="mb-6 font-display text-xl font-semibold text-espresso">
            Procédure de retour
          </h2>
          <ol className="space-y-6">
            {STEPS.map(({ num, title, desc }) => (
              <li key={num} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-espresso font-body text-sm font-bold text-cream">
                  {num}
                </div>
                <div className="pt-0.5">
                  <p className="font-body text-sm font-semibold text-espresso">{title}</p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-taupe">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Défauts de fabrication */}
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl font-semibold text-espresso">
            Défaut de fabrication
          </h2>
          <div className="space-y-3 font-body text-sm leading-relaxed text-taupe">
            <p>
              Si votre article présente un défaut de fabrication avéré (couture
              défaillante, semelle décollée, fermeture éclair cassée dès
              réception, etc.), nous prenons en charge l'intégralité de la
              procédure de retour, y compris les frais de renvoi, dans un délai
              de <strong className="text-espresso">30 jours</strong> suivant la
              livraison.
            </p>
            <p>
              Joignez impérativement des photos claires du défaut à votre
              demande WhatsApp ou e-mail pour accélérer le traitement.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-card border border-sand bg-offwhite p-6 text-center">
          <p className="mb-4 font-body text-sm font-semibold text-espresso">
            Un problème avec votre commande ?
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={whatsappUrl("Bonjour Tchokos SARL 👋\n\nJe souhaite effectuer un retour pour ma commande.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-button bg-espresso px-6 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-cognac"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Demander un retour sur WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-button border border-cognac px-6 py-3 font-body text-sm font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream"
            >
              Autres modes de contact
            </Link>
          </div>
        </div>
      </article>
    </Container>
  );
}
