// Badge du design system : étiquette courte (promo, nouveauté, statut de stock).

const VARIANT_CLASSES = {
  new: "bg-brass text-espresso",
  discount: "bg-bordeaux text-cream",
  success: "bg-sage text-cream",
  neutral: "bg-sand text-taupe",
};

/**
 * @param {Object} props
 * @param {"new"|"discount"|"success"|"neutral"} [props.variant]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export default function Badge({ variant = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-button px-2 py-1 font-body text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
