import Link from "next/link";

// Fil d'Ariane : le dernier élément est la page courante (non cliquable).

/**
 * @param {Object} props
 * @param {{ label: string, href?: string }[]} props.items
 */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-2 font-body text-sm text-taupe">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="text-espresso">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-cognac hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
                >
                  {item.label}
                </Link>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
