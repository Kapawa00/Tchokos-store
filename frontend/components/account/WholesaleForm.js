"use client";

import { useState } from "react";
import { applyWholesale } from "@/lib/account";
import { ApiError } from "@/lib/http";

/** Types d'articles pour la demande grossiste. */
const ITEM_TYPES = [
  "Chaussures hommes",
  "Chaussures femmes",
  "Chaussures enfants",
  "Sacs",
  "Ceintures",
  "Montres",
  "Mixte (plusieurs catégories)",
];

const VOLUME_OPTIONS = [
  "Moins de 10 paires / articles par commande",
  "10 à 50 paires / articles par commande",
  "Plus de 50 paires / articles par commande",
];

/**
 * Formulaire de demande de compte grossiste.
 * @param {{ onSubmitted: (account: import("@/lib/types").WholesaleAccount) => void }} props
 */
export default function WholesaleForm({ onSubmitted }) {
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [itemType, setItemType] = useState("");
  const [volume, setVolume] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(/** @type {Record<string,string>} */ ({}));
  const [globalError, setGlobalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");

    const local = {};
    if (!company.trim()) local.company = "Le nom de la société est requis.";
    if (!itemType) local.item_type = "Sélectionnez un type d'article.";
    if (!volume) local.volume = "Sélectionnez un volume estimé.";
    if (Object.keys(local).length > 0) { setErrors(local); return; }

    setLoading(true);
    try {
      const account = await applyWholesale({
        company: company.trim(),
        city: city.trim() || undefined,
        item_type: itemType,
        volume,
      });
      onSubmitted(account);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {globalError && (
        <div role="alert" className="rounded-card border border-bordeaux/30 bg-bordeaux/5 px-4 py-3">
          <p className="font-body text-sm text-bordeaux">{globalError}</p>
        </div>
      )}

      <Field label="Nom de la société *" error={errors.company}>
        <input
          type="text" value={company} onChange={(e) => setCompany(e.target.value)}
          className={inputCls(!!errors.company)} placeholder="Ex. Boutique Prestige Sarl"
        />
      </Field>

      <Field label="Ville (facultatif)" error={errors.city}>
        <input
          type="text" value={city} onChange={(e) => setCity(e.target.value)}
          className={inputCls(false)} placeholder="Ex. Douala, Yaoundé…"
        />
      </Field>

      <Field label="Type d'articles souhaités *" error={errors.item_type}>
        <select value={itemType} onChange={(e) => setItemType(e.target.value)} className={inputCls(!!errors.item_type)}>
          <option value="">-- Sélectionner --</option>
          {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>

      <Field label="Volume estimé par commande *" error={errors.volume}>
        <select value={volume} onChange={(e) => setVolume(e.target.value)} className={inputCls(!!errors.volume)}>
          <option value="">-- Sélectionner --</option>
          {VOLUME_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60"
      >
        {loading ? "Envoi de la demande…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}

function inputCls(hasError) {
  return `w-full rounded-button border ${hasError ? "border-bordeaux" : "border-sand"} bg-cream px-4 py-3 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso`;
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
