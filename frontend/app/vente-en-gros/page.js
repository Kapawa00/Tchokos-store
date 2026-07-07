import Link from "next/link";
import { Container } from "@/components/ui";
import { whatsappUrl } from "@/lib/config";
import {
  WhatsAppIcon, CheckCircleIcon, BuildingStorefrontIcon,
  TruckIcon, UserIcon, ArrowRightIcon, PackageIcon,
} from "@/components/icons";
import WholesalePublicForm from "./WholesalePublicForm";

export const metadata = {
  title: "Vente en gros — Tchokos SARL",
  description:
    "Devenez partenaire grossiste de Tchokos SARL à Douala. Tarifs dégressifs, livraison en volume, interlocuteur dédié. Faites votre demande en ligne ou sur WhatsApp.",
  openGraph: {
    title: "Vente en gros — Tchokos SARL",
    description: "Tarifs grossiste, livraison en volume et compte dédié pour les professionnels.",
  },
};

const AVANTAGES = [
  {
    icon: BuildingStorefrontIcon,
    title: "Tarifs dégressifs",
    desc: "Plus vous commandez, moins vous payez. Nos grilles tarifaires s'adaptent à vos volumes, dès 10 paires ou articles.",
  },
  {
    icon: PackageIcon,
    title: "Stock en volume",
    desc: "Accès prioritaire aux lots et aux nouvelles collections avant leur mise en vente au détail.",
  },
  {
    icon: TruckIcon,
    title: "Livraison sur mesure",
    desc: "Livraison en gros à Douala et dans les principales villes du Cameroun. Conditionnement adapté au commerce.",
  },
  {
    icon: UserIcon,
    title: "Interlocuteur dédié",
    desc: "Un commercial Tchokos SARL vous est attribué pour suivre vos commandes et vous conseiller sur les tendances.",
  },
  {
    icon: CheckCircleIcon,
    title: "Qualité certifiée",
    desc: "Mêmes produits qu'en boutique, même exigence de sélection — simplement à des prix adaptés aux professionnels.",
  },
  {
    icon: WhatsAppIcon,
    title: "Commande sur WhatsApp",
    desc: "Passez vos commandes en gros directement sur WhatsApp. Réponse garantie en moins de 2 heures ouvrées.",
  },
];

const CONDITIONS = [
  { label: "Commande minimum", value: "10 paires / articles" },
  { label: "Délai de livraison", value: "48 h à 5 jours ouvrés selon la ville" },
  { label: "Paiement", value: "Orange Money, MTN MoMo, virement bancaire" },
  { label: "Retours", value: "Échange possible sous 7 jours sur défaut de fabrication" },
  { label: "Catalogue grossiste", value: "Disponible sur demande (WhatsApp ou compte en ligne)" },
];

const WA_GROSS = whatsappUrl(
  "Bonjour Tchokos SARL 👋\n\nJe suis commerçant(e) et je souhaite me renseigner sur vos tarifs grossiste."
);

export default function VenteEnGrosPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-espresso py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #F6F1E9 0, #F6F1E9 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-brass/40 bg-brass/15 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-widest text-brass">
              Pour les professionnels
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold text-cream sm:text-5xl">
              Vente en gros
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-body text-base text-cream/75">
              Revendeurs, boutiques et commerçants — accédez aux meilleures
              conditions du marché et construisez une relation durable avec
              Tchokos SARL.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#demande"
                className="inline-flex items-center gap-2 rounded-button bg-cream px-7 py-3.5 font-body font-medium text-espresso transition-colors hover:bg-camel"
              >
                Faire une demande
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              <a
                href={WA_GROSS}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-button border border-cream/40 px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cream/10"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp grossiste
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Avantages ── */}
      <section className="py-16 sm:py-24">
        <Container>
          <h2 className="mb-10 text-center font-display text-3xl font-bold text-espresso">
            Pourquoi choisir Tchokos SARL ?
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {AVANTAGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-card border border-sand bg-offwhite p-6 transition-shadow hover:shadow-md">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-espresso/8">
                  <Icon className="h-5 w-5 text-espresso" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-espresso">{title}</h3>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-taupe">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Conditions ── */}
      <section className="bg-sand/30 py-14">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 font-display text-2xl font-bold text-espresso">
              Conditions commerciales
            </h2>
            <dl className="divide-y divide-sand rounded-card border border-sand bg-offwhite">
              {CONDITIONS.map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <dt className="font-body text-sm font-semibold text-espresso">{label}</dt>
                  <dd className="font-body text-sm text-taupe sm:text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* ── Formulaire de demande ── */}
      <section id="demande" className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-bold text-espresso">
                Faire une demande
              </h2>
              <p className="mt-3 font-body text-sm text-taupe">
                Remplissez ce formulaire pour nous contacter via WhatsApp avec
                votre demande pré-remplie. Vous pouvez aussi créer un compte
                pour accéder à l&apos;espace grossiste en ligne.
              </p>
            </div>

            <div className="rounded-card border border-sand bg-offwhite p-6 sm:p-8">
              <WholesalePublicForm />
            </div>

            <div className="mt-6 rounded-card border border-brass/30 bg-brass/5 p-5">
              <p className="font-body text-sm text-espresso">
                <strong>Vous êtes déjà client(e) ?</strong> Connectez-vous et
                accédez à l&apos;espace grossiste pour un suivi en ligne de votre
                demande et l&apos;affichage des prix de gros directement en boutique.
              </p>
              <Link
                href="/compte/grossiste"
                className="mt-3 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-cognac underline-offset-2 hover:underline"
              >
                Accéder à mon espace grossiste
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── CTA WhatsApp bas de page ── */}
      <section className="border-t border-sand bg-offwhite py-14">
        <Container className="text-center">
          <p className="font-display text-xl font-semibold text-espresso">
            Besoin d&apos;une réponse rapide ?
          </p>
          <p className="mt-2 font-body text-sm text-taupe">
            Écrivez-nous directement sur WhatsApp. Notre équipe commerciale
            vous répond en moins de 2 heures.
          </p>
          <a
            href={WA_GROSS}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Contacter le service grossiste
          </a>
        </Container>
      </section>
    </>
  );
}
