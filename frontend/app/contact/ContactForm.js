"use client";

import { useState } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * Formulaire de contact : construit un message WhatsApp pré-rempli et
 * ouvre la conversation. Aucun appel API nécessaire.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const local = {};
    if (!name.trim()) local.name = "Veuillez indiquer votre nom.";
    if (!message.trim()) local.message = "Votre message est vide.";
    if (Object.keys(local).length > 0) { setErrors(local); return; }

    const text = [
      "Bonjour Tchokos SARL 👋",
      "",
      `*Nom :* ${name.trim()}`,
      phone.trim() ? `*Téléphone :* ${phone.trim()}` : null,
      email.trim() ? `*E-mail :* ${email.trim()}` : null,
      "",
      "*Message :*",
      message.trim(),
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.open(buildWhatsAppLink(text), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/15">
          <span className="text-2xl">✓</span>
        </div>
        <p className="font-display text-lg font-semibold text-espresso">
          Message envoyé !
        </p>
        <p className="font-body text-sm text-taupe">
          WhatsApp s&apos;est ouvert avec votre message. Notre équipe vous
          répondra rapidement.
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setName(""); setPhone(""); setEmail(""); setMessage(""); }}
          className="font-body text-sm text-cognac underline-offset-2 hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Nom *" error={errors.name}>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Jean Dupont"
          className={cls(!!errors.name)}
        />
      </Field>

      <Field label="Téléphone (facultatif)">
        <input
          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="237 6XX XX XX XX"
          className={cls(false)}
        />
      </Field>

      <Field label="E-mail (facultatif)">
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.cm"
          className={cls(false)}
        />
      </Field>

      <Field label="Message *" error={errors.message}>
        <textarea
          rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Bonjour, je souhaite me renseigner sur…"
          className={`${cls(!!errors.message)} resize-none`}
        />
      </Field>

      <p className="font-body text-xs text-taupe">
        Votre message sera envoyé via WhatsApp — aucun compte requis.
      </p>

      <button
        type="submit"
        className="w-full rounded-button bg-espresso px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
      >
        Envoyer via WhatsApp
      </button>
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
