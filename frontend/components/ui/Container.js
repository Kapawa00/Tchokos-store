// Conteneur de mise en page : largeur maximale 1280px, centré, marges latérales.

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export default function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
