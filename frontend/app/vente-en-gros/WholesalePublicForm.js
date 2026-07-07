"use client";

import { useState } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";

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
  "10 à 30 paires / articles",
  "30 à 100 paires / articles",
  "Plus de 100 paires / articles",
];

/**
 * Formulaire de demande grossiste publique.
 * Construit un message WhatsApp détaillé et ouvre la conversation.
 * Aucun compte requis — idéal pour un premier contact.
 */
export default function WholesalePublicForm() {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [itemType, setItemType] = useState("");
  const [volume, setVolume] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const local = {};
    if (!name.trim()) local.name = "Votre nom est requis.";
    if (!phone.trim()) local.phone = "Votre numéro de téléphone est requis.";
    if (!itemType) local.itemType = "Sélectionnez un type d'article.";
    if (!volume) local.volume = "Sélectionnez un volume estimé.";
    if (Object.keys(local).length > 0) { setErrors(local); return; }

    const lines = [
      "Bonjour Tchokos SARL 👋",
      "",
      "*Demande de compte grossiste*",
      "",
      `*Nom :* ${name.trim()}`,
      company.trim() ? `*Société :* ${company.trim()}` : null,
      `*Téléphone :* ${phone.trim()}`,
      city.trim() ? `*Ville :* ${city.trim()}` : null,
      `*Articles souhaités :* ${itemType}`,
      `*Volume estimé :* ${volume}`,
      notes.trim() ? `\n*Remarques :*\n${notes.trim()}` : null,
    ].filter((l) => l !== null).join("\n");

    window.open(buildWhatsAppLink(lines), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/15">
          <WhatsAppIcon className="h-7 w-7 text-sage" />
        </div>
        <p className="font-display text-lg font-semibold text-espresso">
          Demande envoyée sur WhatsApp !
        </p>
        <p className="font-body text-sm text-taupe">
          Notre équipe commerciale vous contactera rapidement pour discuter de
          votre demande et vous transmettre notre catalogue grossiste.
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setName(""); setPhone(""); setCompany(""); setCity(""); setItemType(""); setVolume(""); setNotes(""); }}
          className="font-body text-sm text-cognac underline-offset-2 hover:underline"
        >
          Envoyer une nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom complet *" error={errors.name}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Jean Dupont" className={cls(!!errors.name)} />
        </Field>
        <Field label="Société (facultatif)">
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
            placeholder="Boutique Prestige Sarl" className={cls(false)} />
        </Field>
        <Field label="Téléphone / WhatsApp *" error={errors.phone}>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="237 6XX XX XX XX" className={cls(!!errors.phone)} />
        </Field>
        <Field label="Ville">
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="Douala, Yaoundé…" className={cls(false)} />
        </Field>
      </div>

      <Field label="Type d'articles souhaités *" error={errors.itemType}>
        <select value={itemType} onChange={(e) => setItemType(e.target.value)} className={cls(!!errors.itemType)}>
          <option value="">-- Sélectionner --</option>
          {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>

      <Field label="Volume estimé par commande *" error={errors.volume}>
        <select value={volume} onChange={(e) => setVolume(e.target.value)} className={cls(!!errors.volume)}>
          <option value="">-- Sélectionner --</option>
          {VOLUME_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </Field>

      <Field label="Remarques (facultatif)">
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Modèles particuliers, conditions de paiement souhaitées…"
          className={`${cls(false)} resize-none`} />
      </Field>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
      >
        <WhatsAppIcon className="h-5 w-5" />
        Envoyer ma demande via WhatsApp
      </button>

      <p className="text-center font-body text-xs text-taupe">
        Votre message sera envoyé via WhatsApp — aucun compte requis.
      </p>
    </form>
  );
}

function cls(hasError) {
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
