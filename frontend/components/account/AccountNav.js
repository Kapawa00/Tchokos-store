"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PackageIcon,
  HeartIcon,
  MapPinIcon,
  BellIcon,
  BuildingStorefrontIcon,
  UserIcon,
} from "@/components/icons";
import LogoutButton from "./LogoutButton";

/** @type {{ href: string, label: string, icon: (p:any)=>React.JSX.Element }[]} */
const NAV_ITEMS = [
  { href: "/compte", label: "Tableau de bord", icon: HomeIcon },
  { href: "/compte/commandes", label: "Mes commandes", icon: PackageIcon },
  { href: "/compte/favoris", label: "Mes favoris", icon: HeartIcon },
  { href: "/compte/adresses", label: "Carnet d'adresses", icon: MapPinIcon },
  { href: "/compte/notifications", label: "Notifications", icon: BellIcon },
  { href: "/compte/grossiste", label: "Espace grossiste", icon: BuildingStorefrontIcon },
  { href: "/compte/profil", label: "Profil", icon: UserIcon },
];

/**
 * Calcule les initiales (max 2 lettres) à partir d'un nom complet.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  return (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Navigation latérale du compte client.
 * @param {{ user: import("@/lib/types").User|null }} props
 */
export default function AccountNav({ user }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col gap-1 lg:min-h-[calc(100vh-88px)]">
      {/* ── Avatar + nom ── */}
      <div className="mb-4 flex items-center gap-3 rounded-card border border-sand bg-offwhite px-4 py-4 lg:flex-col lg:items-start">
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-espresso text-cream lg:h-12 lg:w-12">
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-body text-sm font-bold lg:text-base">
              {getInitials(user?.name ?? "")}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-body text-sm font-semibold text-espresso">
            {user?.name ?? "Mon compte"}
          </p>
          <p className="truncate font-body text-xs text-taupe">{user?.email ?? ""}</p>
        </div>
      </div>

      {/* ── Liens de navigation ── */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          // Correspondance exacte pour /compte, préfixe pour les sous-routes.
          const active =
            href === "/compte" ? pathname === "/compte" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-button px-4 py-3 font-body text-sm transition-colors ${
                active
                  ? "bg-espresso text-cream"
                  : "text-taupe hover:bg-sand/50 hover:text-espresso"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Déconnexion ── */}
      <div className="mt-auto border-t border-sand pt-4">
        <LogoutButton className="w-full justify-start rounded-button px-4 py-3 hover:bg-sand/50" />
      </div>
    </aside>
  );
}
