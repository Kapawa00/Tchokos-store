/**
 * Indicateur de chargement circulaire.
 * @param {{ small?: boolean, className?: string }} props
 */
export default function Spinner({ small = false, className = "" }) {
  const size = small ? "h-4 w-4" : "h-6 w-6";
  return (
    <span
      className={`${size} inline-block animate-spin rounded-full border-2 border-sand border-t-cognac ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}
