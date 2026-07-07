import { redirect } from "next/navigation";
import { getServerCart, getServerUser } from "@/lib/api.server";
import { Container, Breadcrumb } from "@/components/ui";
import { OrderForm } from "@/components/checkout";
import { CheckoutSummary } from "@/components/checkout";

// Page dynamique : données personnalisées, jamais mises en cache.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Finaliser ma commande — Tchokos SARL",
  description: "Renseignez vos informations pour passer commande chez Tchokos SARL.",
};

const breadcrumb = [
  { label: "Accueil", href: "/" },
  { label: "Panier", href: "/panier" },
  { label: "Commande" },
];

export default async function CheckoutPage() {
  // Appels parallèles : panier + utilisateur connecté.
  const [cart, user] = await Promise.all([
    getServerCart(),
    getServerUser(),
  ]);

  // Redirige vers le panier si le panier est vide ou introuvable.
  if (!cart || cart.items.length === 0) {
    redirect("/panier");
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mb-6">
        <Breadcrumb items={breadcrumb} />
      </div>

      <h1 className="mb-8 font-display text-2xl font-bold text-espresso sm:text-3xl">
        Finaliser ma commande
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* Formulaire côté gauche */}
        <OrderForm cart={cart} user={user} />

        {/* Récapitulatif collé en haut sur desktop */}
        <div className="lg:sticky lg:top-24">
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </Container>
  );
}
