import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Container,
  Input,
  ProductCard,
  Select,
} from "@/components/ui";
import ModalDemo from "./ModalDemo";

export const metadata = {
  title: "Styleguide — Tchokos SARL",
};

/** Couleurs de la charte "Cuir & Crème" — voir CLAUDE.md */
const colors = [
  { name: "cream", hex: "#F6F1E9", bg: "bg-cream", usage: "fond principal" },
  { name: "offwhite", hex: "#FCFAF6", bg: "bg-offwhite", usage: "cartes" },
  { name: "espresso", hex: "#2A211B", bg: "bg-espresso", usage: "titres, texte, bouton principal" },
  { name: "taupe", hex: "#6E6258", bg: "bg-taupe", usage: "texte secondaire, légendes" },
  { name: "cognac", hex: "#9C6B3F", bg: "bg-cognac", usage: "liens, accents, survol des boutons" },
  { name: "camel", hex: "#C89B6A", bg: "bg-camel", usage: "survols, bordures actives" },
  { name: "brass", hex: "#B89A5E", bg: "bg-brass", usage: "filets fins, icônes, badge premium" },
  { name: "bordeaux", hex: "#7A3B3B", bg: "bg-bordeaux", usage: "promos, prix barrés" },
  { name: "sage", hex: "#5B6B57", bg: "bg-sage", usage: "succès, « en stock »" },
  { name: "sand", hex: "#E5DCCD", bg: "bg-sand", usage: "séparateurs, bordures" },
];

function ColorSwatch({ name, hex, bg, usage }) {
  return (
    <div className="rounded-card border border-sand bg-offwhite p-4">
      <div className={`${bg} h-20 w-full rounded-card border border-sand`} />
      <p className="mt-2 font-body text-sm font-medium text-espresso">{name}</p>
      <p className="font-body text-xs text-taupe">{hex}</p>
      <p className="font-body text-xs text-taupe">{usage}</p>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <Container className="py-8">
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Styleguide" },
        ]}
      />
      <h1 className="mt-4 text-4xl font-display text-espresso">Styleguide — Cuir &amp; Crème</h1>
      <p className="mt-2 font-body text-taupe">
        Échantillon des tokens couleur, des titres et du texte courant pour validation visuelle.
      </p>

      <section className="mt-8">
        <h2 className="text-2xl font-display text-espresso">Couleurs</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {colors.map((color) => (
            <ColorSwatch key={color.name} {...color} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-display text-espresso">Titres</h2>
        <div className="mt-4 rounded-card border border-sand bg-offwhite p-4">
          <h1 className="text-4xl font-display text-espresso">H1 — Tchokos SARL</h1>
          <h2 className="mt-2 text-3xl font-display text-espresso">H2 — Tchokos SARL</h2>
          <h3 className="mt-2 text-2xl font-display text-espresso">H3 — Tchokos SARL</h3>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-display text-espresso">Texte courant</h2>
        <div className="mt-4 rounded-card border border-sand bg-offwhite p-4">
          <p className="font-body text-base text-espresso">
            Texte courant en Jost, couleur espresso. « C&apos;est difficile, mais possible ».
          </p>
          <p className="mt-2 font-body text-sm text-taupe">
            Texte secondaire en taupe, pour légendes et descriptions.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-display text-espresso">Boutons</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-card border border-sand bg-offwhite p-4">
          <Button variant="primary" size="sm">Principal sm</Button>
          <Button variant="primary" size="md">Principal md</Button>
          <Button variant="primary" size="lg">Principal lg</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="link">Lien</Button>
          <Button variant="primary" disabled>Désactivé</Button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-display text-espresso">Badges</h2>
        <div className="mt-4 flex flex-wrap gap-4 rounded-card border border-sand bg-offwhite p-4">
          <Badge variant="new">Nouveau</Badge>
          <Badge variant="discount">-20%</Badge>
          <Badge variant="success">En stock</Badge>
          <Badge variant="neutral">Neutre</Badge>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-display text-espresso">Carte</h2>
        <div className="mt-4 max-w-sm">
          <Card className="p-6">
            <p className="font-body text-espresso">
              Carte de base : fond offwhite, coins 6px, ombre douce.
            </p>
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-display text-espresso">Carte produit</h2>
        <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          <ProductCard
            name="Sneakers homme cuir camel"
            imageSrc="/window.svg"
            imageAlt="Sneakers homme cuir camel"
            href="#"
            price="25 000 FCFA"
            badge={{ label: "Nouveau", variant: "new" }}
          />
          <ProductCard
            name="Sac à main femme bordeaux"
            imageSrc="/window.svg"
            imageAlt="Sac à main femme bordeaux"
            href="#"
            price="18 000 FCFA"
            oldPrice="22 000 FCFA"
            badge={{ label: "-18%", variant: "discount" }}
          />
          <ProductCard
            name="Ceinture cuir réversible noir et marron, boucle dorée"
            imageSrc="/window.svg"
            imageAlt="Ceinture cuir réversible"
            href="#"
            price="9 500 FCFA"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-display text-espresso">Champs de formulaire</h2>
        <div className="mt-4 grid max-w-sm gap-4 rounded-card border border-sand bg-offwhite p-4">
          <Input label="Nom complet" placeholder="Votre nom" required />
          <Input label="Téléphone" type="tel" placeholder="6XX XXX XXX" error="Numéro invalide" />
          <Select
            label="Pointure"
            options={[
              { value: "38", label: "38" },
              { value: "39", label: "39" },
              { value: "40", label: "40" },
            ]}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-display text-espresso">Modale</h2>
        <div className="mt-4">
          <ModalDemo />
        </div>
      </section>
    </Container>
  );
}
