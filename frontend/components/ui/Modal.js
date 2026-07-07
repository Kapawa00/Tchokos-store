"use client";

import { useEffect, useId } from "react";

// Fenêtre modale : voile espresso ~60%, boîte crème coins 8px, fermeture au
// clic sur le voile, sur le bouton de fermeture ou via la touche Échap.

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-modal bg-cream p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-button p-1 text-taupe hover:text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id={titleId} className="font-display text-xl text-espresso">
          {title}
        </h2>
        <div className="mt-4 font-body text-espresso">{children}</div>
      </div>
    </div>
  );
}
