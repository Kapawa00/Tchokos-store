"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { EyeIcon, EyeOffIcon, CheckCircleIcon } from "@/components/icons";

// Regex RFC 5322 simplifiée pour la validation côté client.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Formulaire d'inscription avec :
 *   - Validation stricte de l'e-mail (format côté client, domaine côté serveur).
 *   - Modal de succès après inscription, puis redirection vers /compte/connexion
 *     avec l'e-mail pré-rempli.
 */
export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/compte";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isWholesaler, setIsWholesaler] = useState(false);
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(/** @type {Record<string,string>} */ ({}));
  const [globalError, setGlobalError] = useState("");
  const [successUser, setSuccessUser] = useState(/** @type {string|null} */ (null));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    // ─── Validation locale ───
    const local = {};
    if (!name.trim() || name.trim().length < 2)
      local.name = "Le nom doit contenir au moins 2 caractères.";

    if (!email.trim())
      local.email = "L'adresse e-mail est obligatoire.";
    else if (!EMAIL_RE.test(email.trim()))
      local.email = "L'adresse e-mail n'est pas valide (ex : nom@gmail.com).";

    if (password.length < 8)
      local.password = "Le mot de passe doit contenir au moins 8 caractères.";
    if (password !== passwordConfirm)
      local.password_confirmation = "Les mots de passe ne correspondent pas.";
    if (isWholesaler && !company.trim())
      local.company = "Le nom de la société est requis.";

    if (Object.keys(local).length > 0) { setErrors(local); return; }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        password_confirmation: passwordConfirm,
        role: isWholesaler ? "wholesaler" : "customer",
        company: isWholesaler ? company.trim() : undefined,
        device_name: "web",
      });
      // Affiche la modal de succès (le nom du nouveau membre).
      setSuccessUser(name.trim().split(" ")[0]);
    } catch (err) {
      if (err instanceof ApiError && err.isValidation && err.errors) {
        const mapped = {};
        for (const [field, messages] of Object.entries(err.errors)) {
          mapped[field] = Array.isArray(messages) ? messages[0] : messages;
        }
        setErrors(mapped);
      } else {
        setGlobalError(err instanceof ApiError ? err.message : "Erreur réseau. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (successUser !== null) {
    return (
      <SuccessModal
        firstName={successUser}
        email={email.trim()}
        redirectTo={redirectTo}
        router={router}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {globalError && (
        <div role="alert" className="rounded-card border border-bordeaux/30 bg-bordeaux/5 px-4 py-3">
          <p className="font-body text-sm text-bordeaux">{globalError}</p>
        </div>
      )}

      {/* Nom */}
      <Field label="Nom complet" error={errors.name}>
        <input
          type="text" autoComplete="name" required value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldCls(!!errors.name)} placeholder="Jean Dupont"
        />
      </Field>

      {/* E-mail */}
      <Field label="Adresse e-mail" error={errors.email}>
        <input
          type="email" autoComplete="email" required value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
          className={fieldCls(!!errors.email)} placeholder="vous@exemple.cm"
        />
        {!errors.email && (
          <p className="mt-1 font-body text-xs text-taupe">
            Utilisez une vraie adresse e-mail — elle sera vérifiée.
          </p>
        )}
      </Field>

      {/* Téléphone */}
      <Field label="Téléphone (facultatif)" error={errors.phone}>
        <input
          type="tel" autoComplete="tel" value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldCls(!!errors.phone)} placeholder="237 6XX XX XX XX"
        />
      </Field>

      {/* Mot de passe */}
      <Field label="Mot de passe" error={errors.password}>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"} autoComplete="new-password" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            className={fieldCls(!!errors.password) + " pr-11"} placeholder="8 caractères minimum"
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-taupe hover:text-espresso"
            aria-label={showPassword ? "Masquer" : "Afficher"}>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </Field>

      {/* Confirmation mot de passe */}
      <Field label="Confirmer le mot de passe" error={errors.password_confirmation}>
        <div className="relative">
          <input
            type={showPasswordConfirm ? "text" : "password"} autoComplete="new-password" required
            value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
            className={fieldCls(!!errors.password_confirmation) + " pr-11"} placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowPasswordConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-taupe hover:text-espresso"
            aria-label={showPasswordConfirm ? "Masquer" : "Afficher"}>
            {showPasswordConfirm ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </Field>

      {/* Compte grossiste */}
      <div className="rounded-card border border-sand bg-offwhite p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={isWholesaler}
            onChange={(e) => setIsWholesaler(e.target.checked)}
            className="h-4 w-4 accent-espresso" />
          <span className="font-body text-sm text-espresso">Je suis commerçant(e) / grossiste</span>
        </label>
        {isWholesaler && (
          <div className="mt-3">
            <Field label="Nom de la société *" error={errors.company}>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                className={fieldCls(!!errors.company)} placeholder="Ex. Boutique Prestige Sarl" />
            </Field>
          </div>
        )}
      </div>

      <button type="submit" disabled={loading}
        className="w-full rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60">
        {loading ? "Création du compte…" : "Créer mon compte"}
      </button>

      <p className="text-center font-body text-sm text-taupe">
        Déjà inscrit(e) ?{" "}
        <Link
          href={`/compte/connexion${redirectTo !== "/compte" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-semibold text-cognac underline-offset-2 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

// ─── Modal de succès ────────────────────────────────────────────────────────

const COUNTDOWN = 4; // secondes avant redirection automatique

/**
 * Modale de succès après inscription : compte créé, redirection vers la connexion.
 * @param {{ firstName: string, email: string, redirectTo: string, router: any }} props
 */
function SuccessModal({ firstName, email, redirectTo, router }) {
  const [count, setCount] = useState(COUNTDOWN);

  const goToLogin = () => {
    const loginUrl = `/compte/connexion?email=${encodeURIComponent(email)}${
      redirectTo !== "/compte" ? `&redirect=${encodeURIComponent(redirectTo)}` : ""
    }`;
    router.push(loginUrl);
  };

  // Décompte via des setTimeout enchaînés plutôt qu'un setInterval : la
  // navigation (goToLogin) se déclenche depuis l'effet une fois `count` à 0,
  // jamais depuis l'updater de setCount lui-même — appeler router.push()
  // dans un updater de setState déclenche « Cannot update a component while
  // rendering a different component » (React essaie de mettre à jour le
  // Router pendant le rendu de SuccessModal).
  useEffect(() => {
    if (count <= 0) {
      goToLogin();
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      {/* Icône succès */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage/15">
        <CheckCircleIcon className="h-10 w-10 text-sage" />
      </div>

      {/* Titre */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-espresso">
          Bienvenue, {firstName}&nbsp;!
        </h2>
        <p className="mt-1 font-body text-sm text-taupe">
          Votre compte a été créé avec succès.
        </p>
      </div>

      {/* E-mail pré-rempli */}
      <div className="w-full rounded-card border border-sand bg-offwhite px-5 py-4 text-left">
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-taupe">
          Connectez-vous avec
        </p>
        <p className="mt-1 font-body text-sm font-medium text-espresso break-all">{email}</p>
        <p className="mt-1 font-body text-xs text-taupe">
          Votre e-mail a été pré-rempli sur la page de connexion, entrez juste votre mot de passe.
        </p>
      </div>

      {/* Bouton + compteur */}
      <button
        type="button"
        onClick={goToLogin}
        className="w-full rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
      >
        Continuer vers la connexion {count > 0 && `(${count})`}
      </button>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fieldCls(hasError) {
  return `w-full rounded-button border ${
    hasError ? "border-bordeaux" : "border-sand"
  } bg-cream px-4 py-3 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso`;
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-sm font-medium text-espresso">{label}</label>
      {children}
      {error && <p className="mt-1 font-body text-xs text-bordeaux">{error}</p>}
    </div>
  );
}
