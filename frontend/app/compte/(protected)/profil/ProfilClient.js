"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { updateProfile, resendVerificationEmail } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { EyeIcon, EyeOffIcon, CheckCircleIcon, MailIcon } from "@/components/icons";

/**
 * Champ de formulaire générique.
 * @param {{ id: string, label: string, required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>} props
 */
function Field({ id, label, required, className = "", ...rest }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-body text-sm font-medium text-espresso">
        {label} {required && <span aria-hidden="true" className="text-bordeaux">*</span>}
      </label>
      <input
        id={id}
        required={required}
        className={`w-full rounded-button border border-sand bg-offwhite px-4 py-3 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...rest}
      />
    </div>
  );
}

/**
 * Composant client : formulaire de profil (infos + mot de passe).
 * Les formulaires sont bloqués tant que l'e-mail n'est pas vérifié.
 * Un bouton permet de renvoyer l'e-mail de vérification.
 * @param {{ initialUser: import("@/lib/types").User|null }} props
 */
export default function ProfilClient({ initialUser }) {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(initialUser);
  const [verifiedToast, setVerifiedToast] = useState(""); // message après vérification

  // Toast affiché quand le backend redirige vers ?verified=1 après clic du lien.
  useEffect(() => {
    const v = searchParams.get("verified");
    if (v === "1") setVerifiedToast("✓ Votre adresse e-mail a bien été confirmée. Vous pouvez maintenant modifier votre profil.");
    if (v === "already") setVerifiedToast("Votre adresse e-mail était déjà confirmée.");
  }, [searchParams]);

  const isVerified = Boolean(user?.email_verified_at);

  // ─── Renvoi de l'e-mail ───
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleResend = async () => {
    setResendMsg("");
    setResendLoading(true);
    try {
      const res = await resendVerificationEmail();
      setResendMsg(res?.message ?? "E-mail de vérification renvoyé. Vérifiez votre boîte de réception.");
    } catch (err) {
      setResendMsg(err instanceof ApiError ? (err.firstError() ?? err.message) : "Erreur lors de l'envoi.");
    } finally {
      setResendLoading(false);
    }
  };

  // ─── Infos générales ───
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoError(""); setInfoSuccess("");
    setInfoLoading(true);
    try {
      const res = await updateProfile({ name, phone: phone || null });
      setUser(res.user);
      setInfoSuccess("Informations mises à jour.");
    } catch (err) {
      setInfoError(err instanceof ApiError ? (err.firstError() ?? err.message) : "Erreur inattendue.");
    } finally {
      setInfoLoading(false);
    }
  };

  // ─── Mot de passe ───
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError(""); setPwdSuccess("");
    if (newPassword !== confirmPassword) {
      setPwdError("Les mots de passe ne correspondent pas.");
      return;
    }
    setPwdLoading(true);
    try {
      await updateProfile({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPwdSuccess("Mot de passe modifié avec succès.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPwdError(err instanceof ApiError ? (err.firstError() ?? err.message) : "Erreur inattendue.");
    } finally {
      setPwdLoading(false);
    }
  };

  const initials = (user?.name ?? "?")
    .trim().split(/\s+/).slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "").join("");

  return (
    <div className="space-y-8">
      {/* ─── Titre + badge ─── */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-espresso">Mon profil</h1>
        {isVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sage/15 px-2.5 py-1 font-body text-xs font-medium text-sage">
            <CheckCircleIcon className="h-3.5 w-3.5" /> Vérifié
          </span>
        )}
      </div>

      {/* Toast post-vérification */}
      {verifiedToast && (
        <div className="rounded-card border border-sage/40 bg-sage/8 px-4 py-3">
          <p className="font-body text-sm text-sage">{verifiedToast}</p>
        </div>
      )}

      {/* ─── Bannière compte non vérifié ─── */}
      {!isVerified && (
        <div className="rounded-card border border-camel/40 bg-camel/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-camel" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-semibold text-espresso">
                Confirmez votre adresse e-mail
              </p>
              <p className="mt-1 font-body text-sm text-taupe">
                Un e-mail de confirmation a été envoyé à{" "}
                <strong className="text-espresso">{user?.email}</strong>.
                Cliquez sur le lien dans l&apos;e-mail pour activer votre compte et modifier votre profil.
              </p>
              {resendMsg && (
                <p className="mt-2 font-body text-xs text-sage">{resendMsg}</p>
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="mt-3 inline-flex items-center gap-1.5 rounded-button border border-camel/50 bg-cream px-4 py-2 font-body text-xs font-medium text-espresso transition-colors hover:bg-camel hover:text-cream disabled:opacity-50"
              >
                <MailIcon className="h-3.5 w-3.5" />
                {resendLoading ? "Envoi…" : "Renvoyer l'e-mail de confirmation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Avatar ─── */}
      <section className="rounded-card border border-sand bg-offwhite p-5">
        <h2 className="mb-4 font-body text-sm font-semibold text-espresso">Photo de profil</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-espresso text-cream">
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user?.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-body text-xl font-bold">{initials}</span>
            )}
          </div>
          <div>
            <p className="font-body text-sm text-taupe">La photo de profil sera disponible dans une prochaine mise à jour.</p>
            <p className="mt-0.5 font-body text-xs text-taupe/70">Vos initiales sont utilisées automatiquement partout sur le site.</p>
          </div>
        </div>
      </section>

      {/* ─── Informations personnelles ─── */}
      <section className="rounded-card border border-sand bg-offwhite p-5">
        <h2 className="mb-5 font-body text-sm font-semibold text-espresso">Informations personnelles</h2>
        <form onSubmit={handleInfoSubmit} className="space-y-4">
          {infoError && <p role="alert" className="font-body text-sm text-bordeaux">{infoError}</p>}
          {infoSuccess && <p role="status" className="font-body text-sm text-sage">{infoSuccess}</p>}

          <Field
            id="name" label="Nom complet" required type="text" autoComplete="name"
            value={name} onChange={(e) => setName(e.target.value)}
            disabled={!isVerified || infoLoading}
            placeholder="Morange Kapawa"
          />

          {/* E-mail lecture seule */}
          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-espresso">Adresse e-mail</label>
            <div className="relative">
              <input type="email" readOnly value={user?.email ?? ""}
                className="w-full cursor-not-allowed rounded-button border border-sand bg-sand/30 px-4 py-3 font-body text-sm text-taupe" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-xs text-taupe/60">non modifiable</span>
            </div>
          </div>

          <Field
            id="phone" label="Téléphone" type="tel" autoComplete="tel"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            disabled={!isVerified || infoLoading}
            placeholder="+237 6XX XXX XXX"
          />

          {!isVerified && (
            <p className="font-body text-xs text-taupe">
              Confirmez votre e-mail pour pouvoir modifier ces informations.
            </p>
          )}

          <button type="submit" disabled={!isVerified || infoLoading}
            className="rounded-button bg-espresso px-7 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-50">
            {infoLoading ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </form>
      </section>

      {/* ─── Mot de passe ─── */}
      <section className="rounded-card border border-sand bg-offwhite p-5">
        <h2 className="mb-5 font-body text-sm font-semibold text-espresso">Changer le mot de passe</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {pwdError && <p role="alert" className="font-body text-sm text-bordeaux">{pwdError}</p>}
          {pwdSuccess && <p role="status" className="font-body text-sm text-sage">{pwdSuccess}</p>}

          <div>
            <label htmlFor="current_password" className="mb-1.5 block font-body text-sm font-medium text-espresso">
              Mot de passe actuel <span aria-hidden="true" className="text-bordeaux">*</span>
            </label>
            <div className="relative">
              <input id="current_password" type={showCurrent ? "text" : "password"} autoComplete="current-password"
                required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={!isVerified || pwdLoading}
                className="w-full rounded-button border border-sand bg-offwhite px-4 py-3 pr-11 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso disabled:opacity-50"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-taupe hover:text-espresso"
                aria-label={showCurrent ? "Masquer" : "Afficher"}>
                {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new_password" className="mb-1.5 block font-body text-sm font-medium text-espresso">
              Nouveau mot de passe <span aria-hidden="true" className="text-bordeaux">*</span>
            </label>
            <div className="relative">
              <input id="new_password" type={showNew ? "text" : "password"} autoComplete="new-password"
                required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                disabled={!isVerified || pwdLoading}
                className="w-full rounded-button border border-sand bg-offwhite px-4 py-3 pr-11 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso disabled:opacity-50"
                placeholder="Minimum 8 caractères" />
              <button type="button" onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-taupe hover:text-espresso"
                aria-label={showNew ? "Masquer" : "Afficher"}>
                {showNew ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <Field id="confirm_password" label="Confirmer le nouveau mot de passe" required
            type="password" autoComplete="new-password"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!isVerified || pwdLoading} placeholder="••••••••" />

          {!isVerified && (
            <p className="font-body text-xs text-taupe">Confirmez votre e-mail pour pouvoir changer votre mot de passe.</p>
          )}

          <button type="submit"
            disabled={!isVerified || pwdLoading || !currentPassword || !newPassword || !confirmPassword}
            className="rounded-button bg-espresso px-7 py-3 font-body text-sm font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-50">
            {pwdLoading ? "Modification…" : "Changer le mot de passe"}
          </button>
        </form>
      </section>
    </div>
  );
}
