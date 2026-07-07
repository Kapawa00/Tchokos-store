"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CloseIcon, FilterIcon } from "@/components/icons";

// ─── Constantes ───────────────────────────────────────────────────────────────

const SIZES_ADULTES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const SIZES_ENFANTS = ["28", "29", "30", "31", "32", "33", "34", "35"];
const COLORS = ["Noir", "Marron", "Blanc", "Beige", "Camel", "Rouge", "Bleu", "Bordeaux", "Or", "Argenté"];
const SORT_OPTIONS = [
  { value: "", label: "Nouveauté" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSizes(str) {
  return (str ?? "").split(",").filter(Boolean);
}

function joinSizes(arr) {
  return arr.join(",");
}

// ─── Micro-composants ─────────────────────────────────────────────────────────

function SizePill({ size, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(size)}
      aria-pressed={active}
      className={`flex h-8 min-w-[2.5rem] items-center justify-center rounded-button border px-2 font-body text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac ${
        active
          ? "border-cognac bg-cognac text-cream"
          : "border-sand bg-offwhite text-espresso hover:border-cognac"
      }`}
    >
      {size}
    </button>
  );
}

function ColorPill({ color, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(color)}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 font-body text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac ${
        active
          ? "border-espresso bg-espresso text-cream"
          : "border-sand bg-offwhite text-espresso hover:border-cognac"
      }`}
    >
      {color}
    </button>
  );
}

// ─── Contenu des filtres du tiroir mobile ─────────────────────────────────────

function DrawerFilterContent({ state, onChange }) {
  const sizes = parseSizes(state.pointure);

  const toggleSize = (size) => {
    const next = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    onChange("pointure", joinSizes(next));
  };

  const toggleColor = (color) => {
    onChange("couleur", state.couleur === color ? "" : color);
  };

  return (
    <div className="space-y-6">
      {/* Tri */}
      <section>
        <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-taupe">
          Trier par
        </p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange("tri", opt.value)}
              aria-pressed={state.tri === opt.value}
              className={`rounded-button border px-3 py-2 font-body text-sm font-medium transition-colors ${
                state.tri === opt.value
                  ? "border-cognac bg-cognac text-cream"
                  : "border-sand bg-offwhite text-espresso hover:border-cognac"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Disponibilité */}
      <section>
        <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-taupe">
          Disponibilité
        </p>
        <label className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-espresso">
          <input
            type="checkbox"
            checked={state.dispo === "1"}
            onChange={(e) => onChange("dispo", e.target.checked ? "1" : "")}
            className="h-4 w-4 rounded accent-cognac"
          />
          En stock uniquement
        </label>
      </section>

      {/* Pointures */}
      <section>
        <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-taupe">
          Pointure
        </p>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {SIZES_ADULTES.map((s) => (
              <SizePill key={s} size={s} active={sizes.includes(s)} onToggle={toggleSize} />
            ))}
          </div>
          <p className="font-body text-[10px] uppercase tracking-widest text-taupe/70">Enfants</p>
          <div className="flex flex-wrap gap-1.5">
            {SIZES_ENFANTS.map((s) => (
              <SizePill key={s} size={s} active={sizes.includes(s)} onToggle={toggleSize} />
            ))}
          </div>
        </div>
      </section>

      {/* Couleur */}
      <section>
        <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-taupe">
          Couleur
        </p>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <ColorPill key={c} color={c} active={state.couleur === c} onToggle={toggleColor} />
          ))}
        </div>
      </section>

      {/* Prix */}
      <section>
        <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-taupe">
          Prix (FCFA)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={state.min_prix}
            onChange={(e) => onChange("min_prix", e.target.value)}
            min={0}
            className="w-full rounded-button border border-sand bg-cream px-3 py-2.5 font-body text-sm text-espresso placeholder:text-taupe/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          />
          <span className="shrink-0 font-body text-taupe">–</span>
          <input
            type="number"
            placeholder="Max"
            value={state.max_prix}
            onChange={(e) => onChange("max_prix", e.target.value)}
            min={0}
            className="w-full rounded-button border border-sand bg-cream px-3 py-2.5 font-body text-sm text-espresso placeholder:text-taupe/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          />
        </div>
      </section>
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────

/**
 * Barre de filtres et de tri pour les pages collection.
 *
 * Desktop : barre horizontale (tri + dispo + prix) avec seconde ligne de
 * pointures et couleurs en pilules sélectionnables.
 * Mobile : bouton « Filtres » + sélecteur de tri, puis tiroir plein écran.
 *
 * ⚠️ Doit être enveloppé dans <Suspense> car il utilise useSearchParams().
 *
 * @param {Object} props
 * @param {number|null} [props.totalCount] - Nombre total d'articles correspondant.
 */
export default function FiltersClient({ totalCount }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  // Tiroir mobile : ouverture/fermeture
  const [drawerOpen, setDrawerOpen] = useState(false);

  // État local du tiroir mobile (initialiser depuis l'URL courante)
  const [drawer, setDrawer] = useState(() => ({
    tri: sp.get("tri") ?? "",
    pointure: sp.get("pointure") ?? "",
    couleur: sp.get("couleur") ?? "",
    dispo: sp.get("dispo") ?? "",
    min_prix: sp.get("min_prix") ?? "",
    max_prix: sp.get("max_prix") ?? "",
  }));

  // Prix locaux sur desktop (appliqués au blur / Entrée)
  const [priceMin, setPriceMin] = useState(sp.get("min_prix") ?? "");
  const [priceMax, setPriceMax] = useState(sp.get("max_prix") ?? "");

  // Synchroniser l'état local quand l'URL change (retour/avance navigateur)
  useEffect(() => {
    setDrawer({
      tri: sp.get("tri") ?? "",
      pointure: sp.get("pointure") ?? "",
      couleur: sp.get("couleur") ?? "",
      dispo: sp.get("dispo") ?? "",
      min_prix: sp.get("min_prix") ?? "",
      max_prix: sp.get("max_prix") ?? "",
    });
    setPriceMin(sp.get("min_prix") ?? "");
    setPriceMax(sp.get("max_prix") ?? "");
  }, [sp]);

  // Fermeture du tiroir à l'échappement
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // ── Manipulation de l'URL ────────────────────────────────────────────────

  const pushUpdates = useCallback(
    (updates) => {
      const params = new URLSearchParams(sp.toString());
      params.delete("page"); // reset pagination à chaque changement de filtre
      for (const [k, v] of Object.entries(updates)) {
        if (v === "" || v === null || v === undefined || v === false) params.delete(k);
        else params.set(k, String(v));
      }
      const qs = params.toString();
      startTransition(() => router.push(`${pathname}${qs ? `?${qs}` : ""}`));
    },
    [sp, pathname, router]
  );

  // ── Handlers desktop (mise à jour URL immédiate) ──────────────────────────

  const desktopToggleSize = (size) => {
    const curr = parseSizes(sp.get("pointure") ?? "");
    const next = curr.includes(size) ? curr.filter((s) => s !== size) : [...curr, size];
    pushUpdates({ pointure: joinSizes(next) });
  };

  const desktopToggleColor = (color) => {
    pushUpdates({ couleur: sp.get("couleur") === color ? "" : color });
  };

  const desktopApplyPrice = () => {
    pushUpdates({ min_prix: priceMin, max_prix: priceMax });
  };

  const clearAll = () => {
    setPriceMin("");
    setPriceMax("");
    startTransition(() => router.push(pathname));
  };

  // ── Gestion du tiroir mobile ──────────────────────────────────────────────

  const drawerChange = (key, value) => {
    setDrawer((d) => ({ ...d, [key]: value }));
  };

  const applyDrawer = () => {
    const params = new URLSearchParams();
    if (drawer.tri) params.set("tri", drawer.tri);
    if (drawer.pointure) params.set("pointure", drawer.pointure);
    if (drawer.couleur) params.set("couleur", drawer.couleur);
    if (drawer.dispo) params.set("dispo", drawer.dispo);
    if (drawer.min_prix) params.set("min_prix", drawer.min_prix);
    if (drawer.max_prix) params.set("max_prix", drawer.max_prix);
    const qs = params.toString();
    startTransition(() => router.push(`${pathname}${qs ? `?${qs}` : ""}`));
    setDrawerOpen(false);
  };

  // ── Chips des filtres actifs ──────────────────────────────────────────────

  const chips = [];

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sp.get("tri"))?.label;
  if (sp.get("tri")) chips.push({ id: "tri", label: `Tri : ${sortLabel}`, remove: { tri: "" } });

  parseSizes(sp.get("pointure") ?? "").forEach((s) =>
    chips.push({
      id: `size-${s}`,
      label: `Pointure ${s}`,
      remove: {
        pointure: joinSizes(parseSizes(sp.get("pointure") ?? "").filter((v) => v !== s)),
      },
    })
  );

  if (sp.get("couleur"))
    chips.push({ id: "couleur", label: sp.get("couleur"), remove: { couleur: "" } });

  if (sp.get("dispo") === "1")
    chips.push({ id: "dispo", label: "En stock", remove: { dispo: "" } });

  if (sp.get("min_prix"))
    chips.push({
      id: "min_prix",
      label: `Dès ${parseInt(sp.get("min_prix"), 10).toLocaleString("fr-FR")} FCFA`,
      remove: { min_prix: "" },
    });

  if (sp.get("max_prix"))
    chips.push({
      id: "max_prix",
      label: `Jusqu'à ${parseInt(sp.get("max_prix"), 10).toLocaleString("fr-FR")} FCFA`,
      remove: { max_prix: "" },
    });

  const activeCount = chips.length;
  const hasChips = activeCount > 0;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="border-b border-sand pb-1">
      {/* Ligne principale */}
      <div className="flex flex-wrap items-center gap-3 py-3">
        {/* Nombre d'articles */}
        {totalCount != null && (
          <span className="shrink-0 font-body text-sm text-taupe">
            {totalCount.toLocaleString("fr-FR")}{" "}
            {totalCount === 1 ? "article" : "articles"}
          </span>
        )}

        {/* ── Desktop : tri + dispo + prix ── */}
        <div className="hidden flex-1 flex-wrap items-center gap-3 md:flex">
          {/* Tri */}
          <select
            value={sp.get("tri") ?? ""}
            onChange={(e) => pushUpdates({ tri: e.target.value })}
            aria-label="Trier par"
            className="rounded-button border border-sand bg-offwhite px-3 py-2 font-body text-sm text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Dispo */}
          <label className="flex cursor-pointer items-center gap-1.5 font-body text-sm text-espresso">
            <input
              type="checkbox"
              checked={sp.get("dispo") === "1"}
              onChange={(e) => pushUpdates({ dispo: e.target.checked ? "1" : "" })}
              className="h-3.5 w-3.5 rounded accent-cognac"
            />
            En stock
          </label>

          {/* Prix */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              placeholder="Min FCFA"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={desktopApplyPrice}
              onKeyDown={(e) => e.key === "Enter" && desktopApplyPrice()}
              min={0}
              aria-label="Prix minimum"
              className="w-28 rounded-button border border-sand bg-offwhite px-2.5 py-2 font-body text-sm text-espresso placeholder:text-taupe/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
            />
            <span className="text-taupe" aria-hidden="true">–</span>
            <input
              type="number"
              placeholder="Max FCFA"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={desktopApplyPrice}
              onKeyDown={(e) => e.key === "Enter" && desktopApplyPrice()}
              min={0}
              aria-label="Prix maximum"
              className="w-28 rounded-button border border-sand bg-offwhite px-2.5 py-2 font-body text-sm text-espresso placeholder:text-taupe/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
            />
          </div>
        </div>

        {/* ── Mobile : bouton filtres + tri rapide ── */}
        <div className="flex flex-1 items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-button border border-sand px-3 py-2 font-body text-sm text-espresso transition-colors hover:border-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          >
            <FilterIcon className="h-4 w-4" />
            Filtres
            {activeCount > 0 && (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-cognac px-1 font-body text-[11px] font-bold text-cream">
                {activeCount}
              </span>
            )}
          </button>

          {/* Tri rapide mobile */}
          <select
            value={sp.get("tri") ?? ""}
            onChange={(e) => pushUpdates({ tri: e.target.value })}
            aria-label="Trier par"
            className="rounded-button border border-sand bg-offwhite px-3 py-2 font-body text-sm text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Effacer tous les filtres */}
        {hasChips && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto shrink-0 font-body text-xs text-cognac transition-colors hover:text-espresso focus-visible:outline-none focus-visible:underline"
          >
            Effacer tout
          </button>
        )}
      </div>

      {/* ── Pointures et couleurs desktop (seconde ligne) ── */}
      <div className="hidden flex-wrap items-center gap-1.5 pb-3 md:flex">
        {SIZES_ADULTES.map((s) => (
          <SizePill
            key={s}
            size={s}
            active={parseSizes(sp.get("pointure") ?? "").includes(s)}
            onToggle={desktopToggleSize}
          />
        ))}
        {SIZES_ENFANTS.map((s) => (
          <SizePill
            key={s}
            size={s}
            active={parseSizes(sp.get("pointure") ?? "").includes(s)}
            onToggle={desktopToggleSize}
          />
        ))}

        <span className="mx-1.5 h-6 w-px self-center bg-sand" aria-hidden="true" />

        {COLORS.map((c) => (
          <ColorPill
            key={c}
            color={c}
            active={sp.get("couleur") === c}
            onToggle={desktopToggleColor}
          />
        ))}
      </div>

      {/* ── Chips filtres actifs ── */}
      {hasChips && (
        <div className="flex flex-wrap gap-2 pb-3">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => pushUpdates(chip.remove)}
              className="inline-flex items-center gap-1.5 rounded-full border border-cognac/30 bg-cognac/10 px-2.5 py-1 font-body text-xs text-espresso transition-colors hover:border-cognac"
            >
              {chip.label}
              <CloseIcon className="h-3 w-3 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* ── Tiroir mobile ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Fond semi-transparent */}
          <div
            className="absolute inset-0 bg-espresso/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Panneau latéral */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtres"
            className="absolute inset-y-0 right-0 flex w-80 max-w-[90vw] flex-col bg-offwhite shadow-2xl"
          >
            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-sand px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-espresso">Filtres</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fermer les filtres"
                className="rounded-button p-1 text-taupe transition-colors hover:text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Contenu défilable */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <DrawerFilterContent state={drawer} onChange={drawerChange} />
            </div>

            {/* Pied : bouton d'application */}
            <div className="border-t border-sand px-5 py-4">
              <button
                type="button"
                onClick={applyDrawer}
                className="w-full rounded-button bg-espresso py-3.5 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
              >
                Voir les résultats
                {totalCount != null && ` (${totalCount.toLocaleString("fr-FR")})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
