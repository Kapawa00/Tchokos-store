"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth/cookies";
import { apiFetch } from "@/lib/http";
import { logout } from "@/lib/auth";
import { UserIcon, HomeIcon, LogOutIcon } from "@/components/icons";

/**
 * Calcule les initiales d'un nom complet (max 2 lettres, majuscules).
 * Exemples : "Morange Kapawa" → "MK", "Alice" → "A".
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
 * Icône de compte dans la navbar :
 *   - Non connecté → lien vers /compte/connexion (icône personne).
 *   - Connecté → bouton avatar (initiales ou photo) ouvrant un dropdown avec
 *     « Tableau de bord », « Profil » et « Se déconnecter ».
 * La détection se fait entièrement côté client (lecture du cookie JWT + /me)
 * pour ne pas forcer le mode dynamique dans le layout racine.
 */
export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState(/** @type {import("@/lib/types").User|null} */ (null));
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  // Charge le profil une fois au montage si un jeton est présent.
  useEffect(() => {
    const token = getToken();
    console.log("[DEBUG UserMenu] token présent ?", Boolean(token));
    if (!token) return;
    apiFetch("/me", { auth: true, cache: "no-store" })
      .then((data) => {
        console.log("[DEBUG UserMenu] /me OK, rôle =", data?.user?.role);
        setUser(data?.user ?? null);
      })
      .catch((error) => {
        console.log("[DEBUG UserMenu] /me ÉCHEC :", error?.status, error?.message, error);
        setUser(null);
      });
  }, []);

  // Ferme le dropdown au clic en dehors.
  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  // Ferme au touche Échap.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setOpen(false);
    try {
      await logout();
    } catch {
      // Cookie effacé par logout() même en cas d'erreur réseau.
    }
    setUser(null);
    router.push("/compte/connexion");
    router.refresh();
  };

  // ─── Non connecté ───
  if (!user) {
    return (
      <Link
        href="/compte/connexion"
        aria-label="Mon compte"
        className="hidden h-10 w-10 items-center justify-center rounded-button text-espresso transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac sm:inline-flex"
      >
        <UserIcon className="h-5 w-5" />
      </Link>
    );
  }

  // ─── Connecté ───
  const initials = getInitials(user.name);
  const avatarUrl = user.avatar_url ?? null;

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Menu de ${user.name}`}
        className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-espresso text-cream ring-2 ring-transparent transition-all hover:ring-cognac focus-visible:outline-none focus-visible:ring-cognac"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-body text-xs font-bold tracking-tight">{initials}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-card border border-sand bg-offwhite py-1 shadow-lg"
        >
          {/* Nom + e-mail */}
          <div className="border-b border-sand px-4 pb-2.5 pt-3">
            <p className="truncate font-body text-sm font-semibold text-espresso">{user.name}</p>
            <p className="truncate font-body text-xs text-taupe">{user.email}</p>
          </div>

          <Link
            href="/compte"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 font-body text-sm text-espresso transition-colors hover:bg-sand/60"
          >
            <HomeIcon className="h-4 w-4 shrink-0 text-taupe" />
            Tableau de bord
          </Link>

          <Link
            href="/compte/profil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 font-body text-sm text-espresso transition-colors hover:bg-sand/60"
          >
            <UserIcon className="h-4 w-4 shrink-0 text-taupe" />
            Profil
          </Link>

          <div className="border-t border-sand mt-1 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 font-body text-sm text-bordeaux transition-colors hover:bg-bordeaux/10 disabled:opacity-60"
            >
              <LogOutIcon className="h-4 w-4 shrink-0" />
              {loggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
