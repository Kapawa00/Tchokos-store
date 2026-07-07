import { getServerCart, getServerUser } from "@/lib/api.server";
import { Container, Breadcrumb } from "@/components/ui";
import { CartClient } from "@/components/cart";

// Page dynamique : panier spécifique à l'utilisateur, jamais mis en cache.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mon panier — Tchokos SARL",
  description: "Récapitulatif de votre panier Tchokos SARL.",
};

const breadcrumb = [
  { label: "Accueil", href: "/" },
  { label: "Mon panier" },
];

export default async function CartPage() {
  // Appels parallèles : panier + utilisateur (pour affichage conditionnel futur).
  const [cart] = await Promise.all([
    getServerCart(),
    getServerUser(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <div className="mb-6">
        <Breadcrumb items={breadcrumb} />
      </div>

      <h1 className="mb-8 font-display text-2xl font-bold text-espresso sm:text-3xl">
        Mon panier
        {cart && cart.items_count > 0 && (
          <span className="ml-3 font-body text-base font-normal text-taupe">
            ({cart.items_count} article{cart.items_count > 1 ? "s" : ""})
          </span>
        )}
      </h1>

      {/* CartClient gère l'état local et les mutations. */}
      <CartClient initialCart={cart} />
    </Container>
  );
}
