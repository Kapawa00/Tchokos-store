"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { MailIcon } from "@/components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.firstError() ?? err.message);
      } else {
        setError("Impossible d'envoyer l'e-mail. Vérifiez votre connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-md">
        {/* Carte */}
        <div className="rounded-card border border-sand bg-offwhite p-8 shadow-sm">
          {sent ? (
            /* État succès */
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
                <MailIcon className="h-8 w-8 text-sage" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-espresso">
                  E-mail envoyé !
                </h1>
                <p className="mt-3 font-body text-sm leading-relaxed text-taupe">
                  Si <strong className="text-espresso">{email}</strong> correspond
                  à un compte Tchokos, vous recevrez un lien de réinitialisation
                  dans quelques minutes. Pensez à vérifier vos courriers indésirables.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="w-full rounded-button border border-sand bg-cream px-7 py-3 font-body text-sm font-medium text-espresso transition-colors hover:border-espresso"
                >
                  Essayer une autre adresse
                </button>
                <Link
                  href="/compte/connexion"
                  className="block text-center font-body text-sm text-cognac underline-offset-2 hover:underline"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            /* Formulaire */
            <>
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold text-espresso">
                  Mot de passe oublié ?
                </h1>
                <p className="mt-2 font-body text-sm text-taupe">
                  Entrez l'adresse e-mail de votre compte. Nous vous enverrons
                  un lien pour créer un nouveau mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                  <div
                    role="alert"
                    className="rounded-card border border-bordeaux/30 bg-bordeaux/5 px-4 py-3"
                  >
                    <p className="font-body text-sm text-bordeaux">{error}</p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block font-body text-sm font-medium text-espresso"
                  >
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-button border border-sand bg-cream px-4 py-3 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso"
                    placeholder="vous@exemple.cm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60"
                >
                  {loading ? "Envoi en cours…" : "Envoyer le lien"}
                </button>

                <p className="text-center font-body text-sm text-taupe">
                  <Link
                    href="/compte/connexion"
                    className="font-semibold text-cognac underline-offset-2 hover:underline"
                  >
                    ← Retour à la connexion
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
