"use client";

import { WhatsAppIcon, MailIcon, GlobeIcon } from "@/components/icons";

/** @typedef {"whatsapp"|"email"|"site"} Channel */

const CHANNELS = [
  {
    value: /** @type {Channel} */ ("whatsapp"),
    label: "WhatsApp",
    description: "On vous contacte pour finaliser",
    Icon: WhatsAppIcon,
  },
  {
    value: /** @type {Channel} */ ("email"),
    label: "E-mail",
    description: "Confirmation par e-mail",
    Icon: MailIcon,
  },
  {
    value: /** @type {Channel} */ ("site"),
    label: "Sur le site",
    description: "Paiement en ligne",
    Icon: GlobeIcon,
  },
];

/**
 * Cartes radio pour le canal de commande.
 *
 * @param {Object} props
 * @param {Channel} props.value
 * @param {(v: Channel) => void} props.onChange
 */
export default function ChannelSelector({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-3 font-body text-sm font-semibold text-espresso">
        Canal de commande
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CHANNELS.map(({ value: v, label, description, Icon }) => {
          const active = value === v;
          return (
            <label
              key={v}
              className={`flex cursor-pointer items-center gap-3 rounded-card border p-4 transition-colors ${
                active
                  ? "border-espresso bg-espresso/5"
                  : "border-sand bg-offwhite hover:border-camel"
              }`}
            >
              <input
                type="radio"
                name="canal"
                value={v}
                checked={active}
                onChange={() => onChange(v)}
                className="sr-only"
              />
              <Icon
                className={`h-5 w-5 shrink-0 ${active ? "text-espresso" : "text-taupe"}`}
              />
              <div>
                <p
                  className={`font-body text-sm font-semibold ${active ? "text-espresso" : "text-espresso"}`}
                >
                  {label}
                </p>
                <p className="font-body text-xs text-taupe">{description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
