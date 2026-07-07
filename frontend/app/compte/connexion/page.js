import { Suspense } from "react";
import { Container } from "@/components/ui";
import { LoginForm } from "@/components/account";

export const metadata = {
  title: "Connexion — Tchokos SARL",
};

/**
 * Page de connexion.
 * LoginForm utilise useSearchParams → wrapper Suspense requis.
 */
export default function ConnexionPage() {
  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-espresso sm:text-3xl">
            Connexion
          </h1>
          <p className="mt-2 font-body text-sm text-taupe">
            Accédez à votre espace client Tchokos SARL.
          </p>
        </div>

        <div className="rounded-card border border-sand bg-offwhite p-8 shadow-sm">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-card bg-sand/40" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
