"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { EyeIcon, EyeOffIcon, CheckCircleIcon } from "@/components/icons";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(/** @type {Record<string,string>} */ ({}));
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token || !email) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-body text-sm text-bordeaux">
          Lien de réinitialisation invalide ou expiré.
        </p>
        <Link
          href="/compte/mot-de-passe-oublie"
          className="inline-block font-body text-sm font-semibold text-cognac underline-offset-2 hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    const local = {};
    if (password.length < 8) local.password = "Le mot de passe doit contenir au moins 8 caractères.";
    if (password !== passwordConfirm) local.password_confirmation = "Les mots de passe ne correspondent pas.";
    if (Object.keys(local).length > 0) { setErrors(local); return; }

    setLoading(true);
    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirm,
      });
      setSuccess(true);
      setTimeout(() => router.push("/compte/connexion"), 3000);
    } catch (err) {
      if (err instanceof ApiError && err.isValidation && err.errors) {
        const mapped = {};
        for (const [field, messages] of Object.entries(err.errors)) {
          mapped[field] = Array.isArray(messages) ? messages[0] : messages;
        }
        setErrors(mapped);
      } else if (err instanceof ApiError) {
        setGlobalError(err.firstError() ?? err.message);
      } else {
        setGlobalError("Erreur réseau. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
          <CheckCircleIcon className="h-8 w-8 text-sage" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-espresso">
            Mot de passe mis à jour !
          </h2>
          <p className="mt-2 font-body text-sm text-taupe">
            Vous allez être redirigé vers la page de connexion…
          </p>
        </div>
        <Link
          href="/compte/connexion"
          className="inline-block font-body text-sm font-semibold text-cognac underline-offset-2 hover:underline"
        >
          Se connecter maintenant
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {globalError && (
        <div
          role="alert"
          className="rounded-card border border-bordeaux/30 bg-bordeaux/5 px-4 py-3"
        >
          <p className="font-body text-sm text-bordeaux">{globalError}</p>
        </div>
      )}

      {/* Nouveau mot de passe */}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block font-body text-sm font-medium text-espresso"
        >
          Nouveau mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-button border ${errors.password ? "border-bordeaux" : "border-sand"} bg-cream px-4 py-3 pr-11 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso`}
            placeholder="8 caractères minimum"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-taupe transition-colors hover:text-espresso"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 font-body text-xs text-bordeaux">{errors.password}</p>
        )}
      </div>

      {/* Confirmation */}
      <div>
        <label
          htmlFor="password_confirmation"
          className="mb-1.5 block font-body text-sm font-medium text-espresso"
        >
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <input
            id="password_confirmation"
            type={showPasswordConfirm ? "text" : "password"}
            autoComplete="new-password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={`w-full rounded-button border ${errors.password_confirmation ? "border-bordeaux" : "border-sand"} bg-cream px-4 py-3 pr-11 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-taupe transition-colors hover:text-espresso"
            aria-label={showPasswordConfirm ? "Masquer la confirmation" : "Afficher la confirmation"}
          >
            {showPasswordConfirm ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password_confirmation && (
          <p className="mt-1 font-body text-xs text-bordeaux">{errors.password_confirmation}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60"
      >
        {loading ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-card border border-sand bg-offwhite p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-espresso">
              Nouveau mot de passe
            </h1>
            <p className="mt-2 font-body text-sm text-taupe">
              Choisissez un mot de passe sécurisé d'au moins 8 caractères.
            </p>
          </div>
          {/* Suspense requis par useSearchParams() dans un composant client */}
          <Suspense fallback={<p className="font-body text-sm text-taupe">Chargement…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
