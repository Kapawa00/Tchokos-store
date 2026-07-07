import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui";
import { whatsappUrl } from "@/lib/config";
import { WhatsAppIcon, CheckCircleIcon, ArrowRightIcon } from "@/components/icons";

export const metadata = {
  title: "À propos — Tchokos SARL",
  description:
    "Découvrez l'histoire de Tchokos SARL, grossiste-détaillant de chaussures et accessoires à Akwa, Douala. Notre mission : rendre la mode accessible à tous.",
  openGraph: {
    title: "À propos — Tchokos SARL",
    description: "Histoire, valeurs et mission de Tchokos SARL, boutique de chaussures à Douala.",
  },
};

/** Nos valeurs */
const VALUES = [
  {
    title: "Qualité sans compromis",
    desc: "Chaque modèle est sélectionné avec rigueur. Nous ne référençons que des articles durables et élégants, adaptés aux conditions locales.",
  },
  {
    title: "Accessibilité pour tous",
    desc: "Du client particulier au revendeur, nos tarifs s'adaptent. Détail ou gros, Tchokos SARL est le partenaire de votre style.",
  },
  {
    title: "Confiance & transparence",
    desc: "Pas de mauvaises surprises : le prix affiché est le prix payé. Nos retours et échanges sont traités avec honnêteté et rapidité.",
  },
  {
    title: "Proximité & réactivité",
    desc: "Notre équipe répond sur WhatsApp en moins d'une heure. Commander doit rester simple, qu'on soit à Akwa ou à Maroua.",
  },
];

/** Chiffres clés */
const STATS = [
  { value: "500+", label: "Modèles disponibles" },
  { value: "10 ans", label: "D'expérience à Douala" },
  { value: "5 000+", label: "Clients satisfaits" },
  { value: "48 h", label: "Délai de livraison local" },
];

export default function AProposPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-espresso py-24 sm:py-32">
        {/* Motif décoratif */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #F6F1E9 0, #F6F1E9 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <Container className="relative text-center">
          <span className="inline-block rounded-full border border-camel/40 bg-camel/10 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-widest text-camel">
            Akwa, Douala — depuis 2014
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold text-cream sm:text-5xl lg:text-6xl">
            Tchokos <span className="text-camel">SARL</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-display text-2xl italic text-cream/80 sm:text-3xl">
            « C&apos;est difficile, mais possible. »
          </p>
          <p className="mx-auto mt-6 max-w-xl font-body text-base text-cream/70">
            Grossiste-détaillant de chaussures et accessoires au cœur de Douala.
            Du Cameroun à votre dressing, avec passion et exigence.
          </p>
        </Container>
      </section>

      {/* ── Chiffres clés ── */}
      <section className="border-b border-sand bg-offwhite py-14">
        <Container>
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <dt className="font-display text-3xl font-bold text-espresso sm:text-4xl">
                  {value}
                </dt>
                <dd className="mt-1 font-body text-sm text-taupe">{label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── Notre histoire ── */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-espresso sm:text-4xl">
              Notre histoire
            </h2>
            <div className="mt-8 space-y-5 font-body text-base leading-relaxed text-taupe">
              <p>
                Tout commence en 2014, dans un petit local du quartier{" "}
                <strong className="text-espresso">Akwa</strong>, au cœur
                commercial de Douala. Quelques paires de chaussures soigneusement
                sélectionnées, une vitrine modeste, et une conviction chevillée au
                corps : <em>« C&apos;est difficile, mais possible. »</em>
              </p>
              <p>
                Dix ans plus tard, Tchokos SARL s&apos;est imposée comme une
                référence incontournable dans la distribution de chaussures et
                d&apos;accessoires au Cameroun. Notre catalogue s&apos;est élargi
                pour inclure des modèles hommes, femmes et enfants, mais aussi des{" "}
                <strong className="text-espresso">sacs</strong>,{" "}
                <strong className="text-espresso">ceintures</strong> et{" "}
                <strong className="text-espresso">montres</strong> sélectionnés avec
                le même souci d&apos;exigence.
              </p>
              <p>
                Notre double positionnement{" "}
                <strong className="text-espresso">grossiste et détaillant</strong>{" "}
                nous permet de servir aussi bien le client particulier à la
                recherche d&apos;une paire unique que le revendeur qui commande des
                dizaines de boîtes. Les prix s&apos;adaptent au volume ; la qualité,
                elle, ne varie pas.
              </p>
              <p>
                Nous avons fait le choix du{" "}
                <strong className="text-espresso">numérique</strong> pour
                rapprocher nos produits de nos clients, où qu&apos;ils se trouvent au
                Cameroun. Commander en ligne via notre boutique ou sur WhatsApp,
                c&apos;est choisir la simplicité sans perdre le lien humain qui a
                toujours été l&apos;âme de Tchokos SARL.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Ce que nous proposons ── */}
      <section className="bg-sand/30 py-16 sm:py-20">
        <Container>
          <h2 className="mb-10 text-center font-display text-3xl font-bold text-espresso">
            Ce que nous proposons
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { cat: "Chaussures Hommes", desc: "Du derby classique à la sneaker moderne, notre rayon homme couvre tous les styles et occasions." },
              { cat: "Chaussures Femmes", desc: "Escarpins, ballerines, sandales, bottines — une sélection portée sur l'élégance et le confort." },
              { cat: "Chaussures Enfants", desc: "Des modèles résistants et stylés pour que les petits marchent aussi bien que les grands." },
              { cat: "Sacs", desc: "Sacs à main, sacs à dos, pochettes — des accessoires qui complètent chaque tenue." },
              { cat: "Ceintures", desc: "En cuir ou matières nobles, pour les hommes et les femmes, simples ou ornées." },
              { cat: "Montres", desc: "Des montres aux styles variés, de la montre sport à la montre de ville." },
            ].map(({ cat, desc }) => (
              <div
                key={cat}
                className="rounded-card border border-sand bg-offwhite p-6 transition-shadow hover:shadow-md"
              >
                <p className="mb-2 font-display text-base font-semibold text-espresso">
                  {cat}
                </p>
                <p className="font-body text-sm text-taupe">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Nos valeurs ── */}
      <section className="py-16 sm:py-24">
        <Container>
          <h2 className="mb-10 text-center font-display text-3xl font-bold text-espresso">
            Nos valeurs
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {VALUES.map(({ title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="mt-0.5 shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-cognac" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-espresso">
                    {title}
                  </h3>
                  <p className="mt-1 font-body text-sm leading-relaxed text-taupe">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="bg-espresso py-16">
        <Container className="text-center">
          <h2 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Prêt(e) à explorer notre catalogue ?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-sm text-cream/75">
            Parcourez plus de 500 modèles directement en ligne, ou contactez-nous
            sur WhatsApp pour un conseil personnalisé.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 rounded-button bg-cream px-7 py-3.5 font-body font-medium text-espresso transition-colors hover:bg-camel"
            >
              Voir la boutique
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              href={whatsappUrl("Bonjour Tchokos SARL 👋\n\nJe souhaite en savoir plus sur vos produits.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-button border border-cream/40 px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cream/10"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Contacter sur WhatsApp
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
