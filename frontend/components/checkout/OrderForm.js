"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/orders";
import { buildWhatsAppLink, buildOrderMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";
import ChannelSelector from "./ChannelSelector";
import { useCart } from "@/components/cart/CartProvider";


/**
 * Groupe label + input + message d'erreur. Défini hors du composant parent
 * pour éviter que React le considère comme un nouveau type à chaque re-render,
 * ce qui provoquerait une perte de focus après chaque frappe.
 *
 * @param {{ id: string, label: string, required?: boolean, error?: string, children: React.ReactNode }} props
 */
function Field({ id, label, required, error, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-body text-sm font-semibold text-espresso"
      >
        {label}
        {required && <span className="ml-0.5 text-bordeaux">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 font-body text-xs text-bordeaux" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Formulaire de commande : informations client, canal, livraison.
 * Appelle createOrder puis redirige vers la page de confirmation.
 *
 * @param {Object} props
 * @param {import("@/lib/types").Cart} props.cart
 * @param {import("@/lib/types").User|null} props.user
 */
export default function OrderForm({ cart, user }) {
  const router = useRouter();
  const { refresh } = useCart();

  // ── Champs du formulaire ────────────────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [ville, setVille] = useState("Douala");
  const [quartier, setQuartier] = useState("");
  const [notes, setNotes] = useState("");
  const [channel, setChannel] = useState(/** @type {import("@/lib/types").OrderChannel} */ ("whatsapp"));

  // ── État de soumission ──────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");

  /** @type {Record<string, string>} */
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    /** @type {Record<string, string>} */
    const errs = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = "Nom requis (2 caractères minimum).";
    }
    if (!phone.trim()) {
      errs.phone = "Numéro de téléphone requis.";
    }
    if (channel === "email" && !email.trim()) {
      errs.email = "E-mail requis pour ce canal.";
    }
    if (!quartier.trim()) {
      errs.quartier = "Veuillez indiquer votre quartier.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Soumission ──────────────────────────────────────────────────────────────

  /**
   * @param {"whatsapp"|"email"|"site"|null} [channelOverride]
   */
  const handleSubmit = async (channelOverride = null) => {
    if (!validate()) return;
    setGlobalError("");
    setSubmitting(true);

    const effectiveChannel = channelOverride ?? channel;

    // Adresse de livraison intégrée dans les notes
    const livraisonLine = `Livraison : ${quartier}, ${ville}`;
    const composedNotes = [livraisonLine, notes.trim()].filter(Boolean).join("\n\n");

    try {
      const order = await createOrder({
        channel: effectiveChannel,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || undefined,
        notes: composedNotes,
      });

      // Rafraîchit le badge du panier (le backend vide le panier après commande).
      await refresh();

      // Ouvre WhatsApp si canal WhatsApp ou bouton WhatsApp direct.
      if (effectiveChannel === "whatsapp") {
        window.open(
          buildWhatsAppLink(buildOrderMessage(order)),
          "_blank",
          "noopener,noreferrer"
        );
      }

      // Redirige vers la confirmation.
      const params = new URLSearchParams({ canal: effectiveChannel });
      if (!user && phone) params.set("phone", phone.trim());
      router.push(`/commande/confirmation/${order.reference}?${params}`);
    } catch (err) {
      const msg =
        typeof err.firstError === "function"
          ? err.firstError()
          : "Une erreur est survenue. Veuillez réessayer.";
      setGlobalError(msg ?? "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-button border border-sand bg-offwhite px-4 py-3 font-body text-sm text-espresso placeholder:text-taupe/60 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      {/* ── Informations client ── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold text-espresso">
          Vos informations
        </h2>

        <Field id="nom" label="Nom complet" required error={fieldErrors.name}>
          <input
            id="nom"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean-Paul Kamga"
            className={inputClass}
            aria-invalid={Boolean(fieldErrors.name)}
          />
        </Field>

        <Field id="telephone" label="Téléphone" required error={fieldErrors.phone}>
          <input
            id="telephone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="6XXXXXXXX ou +2376XXXXXXXX"
            className={inputClass}
            aria-invalid={Boolean(fieldErrors.phone)}
          />
        </Field>

        <Field
          id="email"
          label="E-mail"
          required={channel === "email"}
          error={fieldErrors.email}
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jean@exemple.cm"
            className={inputClass}
            aria-invalid={Boolean(fieldErrors.email)}
          />
        </Field>
      </section>

      {/* ── Livraison ── */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold text-espresso">
          Livraison
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="ville" label="Ville" error={fieldErrors.ville}>
            <input
              id="ville"
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Douala"
              className={inputClass}
            />
          </Field>

          <Field id="quartier" label="Quartier" required error={fieldErrors.quartier}>
            <input
              id="quartier"
              type="text"
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              placeholder="Akwa, Bonanjo, Deïdo…"
              className={inputClass}
              aria-invalid={Boolean(fieldErrors.quartier)}
            />
          </Field>
        </div>

        <Field id="notes" label="Instructions supplémentaires" error="">
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex. : livraison en journée, numéro de porte, point de repère…"
            className={`${inputClass} resize-none`}
          />
        </Field>
      </section>

      {/* ── Canal de commande ── */}
      <ChannelSelector value={channel} onChange={setChannel} />

      {/* ── Erreur globale ── */}
      {globalError && (
        <div
          role="alert"
          className="rounded-card border border-bordeaux/30 bg-bordeaux/5 px-4 py-3 font-body text-sm text-bordeaux"
        >
          {globalError}
        </div>
      )}

      {/* ── Boutons de soumission ── */}
      <div className="flex flex-col gap-3 border-t border-sand pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-button bg-espresso px-7 py-4 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60"
        >
          {submitting ? "Envoi en cours…" : "Confirmer la commande"}
        </button>

        <button
          type="button"
          onClick={() => handleSubmit("whatsapp")}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-button border border-cognac px-7 py-3.5 font-body font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Finaliser sur WhatsApp
        </button>
      </div>
    </form>
  );
}
