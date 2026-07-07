"use client";

// Bouton du design system "Cuir & Crème". Composant client car destiné à
// recevoir des gestionnaires d'événements (onClick) de la part des pages.

const VARIANT_CLASSES = {
  primary: "bg-espresso text-cream hover:bg-cognac",
  secondary: "border border-cognac text-espresso bg-transparent hover:bg-cream",
  link: "bg-transparent p-0 text-cognac underline-offset-4 hover:underline",
};

const SIZE_CLASSES = {
  sm: "px-4 py-2 text-sm",
  md: "px-7 py-3.5 text-base",
  lg: "px-9 py-4 text-lg",
};

/**
 * @param {Object} props
 * @param {"primary"|"secondary"|"link"} [props.variant]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {boolean} [props.disabled]
 * @param {"button"|"submit"|"reset"} [props.type]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  children,
  className = "",
  ...rest
}) {
  const isLink = variant === "link";

  const variantClasses = disabled
    ? "bg-sand text-taupe cursor-not-allowed"
    : VARIANT_CLASSES[variant];

  const sizeClasses = isLink ? "text-base" : SIZE_CLASSES[size];

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-button font-body font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
