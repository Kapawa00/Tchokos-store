"use client";

import { WhatsAppIcon } from "@/components/icons";

/** @typedef {"orange_money"|"momo"|"whatsapp"} PaymentMethod */

/** Icône Orange Money (cercle orange stylisé). */
function OrangeMoneyIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path
        fill="white"
        d="M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
      />
    </svg>
  );
}

/** Icône MTN MoMo (jaune). */
function MomoIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <path fill="white" d="M7 9h2l1.5 4L12 9h2v6h-1.5v-3.5L11 15h-1l-1.5-3.5V15H7V9z" />
    </svg>
  );
}

const METHODS = [
  {
    value: /** @type {PaymentMethod} */ ("orange_money"),
    label: "Orange Money",
    description: "Paiement mobile Orange",
    Icon: OrangeMoneyIcon,
    color: "text-orange-500",
    bg: "bg-orange-50 border-orange-200",
    activeBg: "bg-orange-50 border-orange-500",
  },
  {
    value: /** @type {PaymentMethod} */ ("momo"),
    label: "MTN MoMo",
    description: "Mobile Money MTN",
    Icon: MomoIcon,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    activeBg: "bg-yellow-50 border-yellow-500",
  },
  {
    value: /** @type {PaymentMethod} */ ("whatsapp"),
    label: "WhatsApp",
    description: "Envoi de preuve assisté",
    Icon: WhatsAppIcon,
    color: "text-sage",
    bg: "bg-sage/5 border-sand",
    activeBg: "bg-sage/10 border-sage",
  },
];

/**
 * Cartes de sélection du moyen de paiement.
 *
 * @param {Object} props
 * @param {PaymentMethod|null} props.value
 * @param {(v: PaymentMethod) => void} props.onChange
 */
export default function MethodSelector({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-3 font-body text-sm font-semibold text-espresso">
        Choisissez votre moyen de paiement
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {METHODS.map(({ value: v, label, description, Icon, color, bg, activeBg }) => {
          const active = value === v;
          return (
            <label
              key={v}
              className={`flex cursor-pointer items-center gap-3 rounded-card border-2 p-4 transition-all ${
                active ? activeBg : `${bg} hover:border-taupe/40`
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value={v}
                checked={active}
                onChange={() => onChange(v)}
                className="sr-only"
              />
              <Icon className={`h-7 w-7 shrink-0 ${color}`} />
              <div>
                <p className="font-body text-sm font-semibold text-espresso">{label}</p>
                <p className="font-body text-xs text-taupe">{description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
