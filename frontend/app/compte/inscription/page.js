import { Suspense } from "react";
import { Container } from "@/components/ui";
import { RegisterForm } from "@/components/account";

export const metadata = {
  title: "Créer un compte — Tchokos SARL",
};

/**
 * Page d'inscription.
 * RegisterForm utilise useSearchParams → wrapper Suspense requis.
 */
export default function InscriptionPage() {
  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
            Créer un compte
          </h1>
          <p className="mt-2 font-body text-sm text-taupe">
            Rejoignez Tchokos SARL — boutique grossiste de chaussures à Douala.
          </p>
        </div>

        <div className="rounded-card border border-sand bg-offwhite p-8 shadow-sm">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-sand/40" />}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
