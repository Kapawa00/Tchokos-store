"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

/**
 * Formulaire de connexion e-mail / mot de passe.
 * Après authentification, redirige vers `?redirect` ou `/compte`.
 * Les rôles admin/manager sont renvoyés vers le panneau Filament via le lien
 * signé `admin_redirect_url` (cf. AuthController::login()) : une seule saisie
 * de mot de passe, la session Filament s'ouvre automatiquement.
 */
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/compte";

  // Pré-rempli depuis l'URL quand on vient de l'inscription (?email=...).
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ email, password, device_name: "web" });

      // Admin et manager → panneau Filament, via le lien de connexion unique
      // signé par le backend (ouvre directement la session, sans second mot
      // de passe à saisir sur /admin/login).
      if (result?.admin_redirect_url) {
        window.location.href = result.admin_redirect_url;
        return;
      }

      router.push(redirectTo.startsWith("/") ? redirectTo : "/compte");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.firstError() ?? err.message);
      } else {
        setError("Connexion impossible. Vérifiez votre réseau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div role="alert" className="rounded-card border border-bordeaux/30 bg-bordeaux/5 px-4 py-3">
          <p className="font-body text-sm text-bordeaux">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block font-body text-sm font-medium text-espresso">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-button border border-sand bg-offwhite px-4 py-3 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso"
          placeholder="vous@exemple.cm"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="password" className="font-body text-sm font-medium text-espresso">
            Mot de passe
          </label>
          <Link
            href="/compte/mot-de-passe-oublie"
            className="font-body text-xs text-cognac underline-offset-2 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-button border border-sand bg-offwhite px-4 py-3 pr-11 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso"
            placeholder="••••••••"
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-center font-body text-sm text-taupe">
        Pas encore de compte ?{" "}
        <Link
          href={`/compte/inscription${redirectTo !== "/compte" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-semibold text-cognac underline-offset-2 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
