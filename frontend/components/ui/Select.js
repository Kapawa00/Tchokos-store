"use client";

import { useId } from "react";

// Menu déroulant du design system, avec libellé et message d'erreur accessibles.

/**
 * @param {Object} props
 * @param {string} [props.id]
 * @param {string} props.label
 * @param {{ value: string, label: string }[]} props.options
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {string} [props.className]
 */
export default function Select({
  id,
  label,
  options,
  error,
  required = false,
  className = "",
  ...rest
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={selectId} className="font-body text-sm text-espresso">
        {label}
        {required && <span className="text-bordeaux"> *</span>}
      </label>
      <select
        id={selectId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`rounded-button border bg-offwhite px-4 py-2.5 font-body text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac ${
          error ? "border-bordeaux" : "border-sand"
        }`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="font-body text-xs text-bordeaux">
          {error}
        </p>
      )}
    </div>
  );
}
