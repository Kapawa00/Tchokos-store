"use client";

import { useId } from "react";

// Champ de saisie du design system, avec libellé et message d'erreur accessibles.

/**
 * @param {Object} props
 * @param {string} [props.id]
 * @param {string} props.label
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {string} [props.className]
 */
export default function Input({
  id,
  label,
  error,
  required = false,
  className = "",
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="font-body text-sm text-espresso">
        {label}
        {required && <span className="text-bordeaux"> *</span>}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`rounded-button border bg-offwhite px-4 py-2.5 font-body text-espresso placeholder:text-taupe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac ${
          error ? "border-bordeaux" : "border-sand"
        }`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="font-body text-xs text-bordeaux">
          {error}
        </p>
      )}
    </div>
  );
}
