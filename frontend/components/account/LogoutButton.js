"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { LogOutIcon } from "@/components/icons";

/**
 * Bouton de déconnexion : révoque le jeton côté API, efface le cookie,
 * redirige vers la page de connexion.
 *
 * @param {{ className?: string, compact?: boolean }} props
 */
export default function LogoutButton({ className = "", compact = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch {
      // Cookie déjà nettoyé par logout() même en cas d'erreur réseau.
    }
    router.push("/compte/connexion");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 font-body text-sm text-taupe transition-colors hover:text-bordeaux disabled:opacity-60 ${className}`}
    >
      <LogOutIcon className="h-4 w-4 shrink-0" />
      {!compact && (loading ? "Déconnexion…" : "Se déconnecter")}
    </button>
  );
}
