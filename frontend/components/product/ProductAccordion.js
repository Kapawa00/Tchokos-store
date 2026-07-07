"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/icons";

// Sections fixes communes à tous les produits.
const STATIC_SECTIONS = [
  {
    id: "materiau",
    title: "Matière & Entretien",
    content:
      "Nos articles sont confectionnés en cuir véritable et matières de qualité. " +
      "Pour l'entretien : essuyez avec un chiffon doux légèrement humide, appliquez " +
      "une crème nourrissante pour cuir une fois par mois. Évitez l'exposition " +
      "prolongée à l'humidité et rangez dans un sac de protection.",
  },
  {
    id: "livraison",
    title: "Livraison & Retours",
    content:
      "Livraison à Douala sous 24 à 48 h après confirmation de commande. " +
      "Retours acceptés dans les 7 jours suivant la réception, articles non portés " +
      "dans leur emballage d'origine. Paiement à la livraison disponible : " +
      "Orange Money, MTN MoMo, espèces.",
  },
];

/**
 * Accordéon produit : Description (si disponible), Matière & Entretien,
 * Livraison & Retours. Un seul panneau ouvert à la fois.
 *
 * @param {Object} props
 * @param {string|null} [props.description] - Description HTML ou texte brut.
 */
export default function ProductAccordion({ description }) {
  const sections = [
    ...(description
      ? [
          {
            id: "description",
            title: "Description",
            content: description,
            isHtml: true,
          },
        ]
      : []),
    ...STATIC_SECTIONS,
  ];

  // Ouvrir la description par défaut si elle existe, sinon la première section.
  const [openId, setOpenId] = useState(sections[0]?.id ?? null);

  const toggle = (id) => setOpenId((curr) => (curr === id ? null : id));

  return (
    <div className="divide-y divide-sand">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        const btnId = `acc-btn-${section.id}`;
        const panelId = `acc-panel-${section.id}`;

        return (
          <div key={section.id}>
            <button
              id={btnId}
              type="button"
              onClick={() => toggle(section.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cognac"
            >
              <span className="font-body text-base font-semibold text-espresso">
                {section.title}
              </span>
              {isOpen ? (
                <ChevronUpIcon className="h-5 w-5 shrink-0 text-taupe transition-transform" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 shrink-0 text-taupe transition-transform" />
              )}
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={isOpen ? undefined : "hidden"}
            >
              <div className="pb-5 font-body text-sm leading-relaxed text-taupe">
                {section.isHtml ? (
                  /*
                   * Le contenu provient exclusivement du back-office Filament
                   * (éditeur interne) — dangerouslySetInnerHTML est acceptable ici.
                   */
                  <div
                    className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-espresso prose-a:text-cognac"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                ) : (
                  <p>{section.content}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
