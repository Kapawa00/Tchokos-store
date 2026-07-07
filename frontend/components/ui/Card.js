// Carte de base du design system : fond clair, coins arrondis, ombre douce.

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export default function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`rounded-card bg-offwhite shadow-[0_2px_12px_rgba(42,33,27,0.08)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
