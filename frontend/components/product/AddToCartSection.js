"use client";

import { useState, useMemo } from "react";
import { addToCart } from "@/lib/cart";
import { useCart } from "@/components/cart/CartProvider";
import { buildWhatsAppLink, buildProductMessage } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { MinusIcon, PlusIcon, WhatsAppIcon } from "@/components/icons";
import FavoriteButton from "@/components/account/FavoriteButton";

// ─── Sous-composant : pastille de sélection ──────────────────────────────────

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {boolean} props.active
 * @param {boolean} [props.unavailable]
 * @param {() => void} props.onSelect
 */
function OptionPill({ label, active, unavailable = false, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      disabled={unavailable}
      className={`rounded-button border px-3 py-2 font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:cursor-not-allowed disabled:opacity-40 ${
        unavailable ? "line-through" : ""
      } ${
        active
          ? "border-espresso bg-espresso text-cream"
          : "border-sand bg-offwhite text-espresso hover:border-espresso"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────

/**
 * Sélecteurs de variantes (pointure / couleur), quantité et boutons d'action.
 * Identifiant `#add-to-cart-anchor` sur le groupe de boutons — utilisé par
 * MobileActionBar pour détecter la visibilité via IntersectionObserver.
 *
 * @param {Object} props
 * @param {import("@/lib/types").ProductDetail} props.product
 */
export default function AddToCartSection({ product }) {
  const { refresh } = useCart();
  const variants = product.variants ?? [];

  // ── Tailles et couleurs disponibles ─────────────────────────────────────────
  const availableSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))],
    [variants]
  );
  const availableColors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean))],
    [variants]
  );

  const hasSizes = availableSizes.length > 0;
  const hasColors = availableColors.length > 0;

  // ── État de sélection ───────────────────────────────────────────────────────
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, message }

  // ── Résolution de la variante correspondante ─────────────────────────────────
  const matchingVariant = useMemo(() => {
    if (variants.length === 0) return null;
    if (!hasSizes && !hasColors) return variants[0]; // variante unique sans options
    return variants.find((v) => {
      const sizeOk = !hasSizes || v.size === selectedSize;
      const colorOk = !hasColors || v.color === selectedColor;
      return sizeOk && colorOk;
    }) ?? null;
  }, [variants, hasSizes, hasColors, selectedSize, selectedColor]);

  const isInStock = matchingVariant?.in_stock ?? false;
  const stockCount = matchingVariant?.stock ?? 0;
  const variantPrice = matchingVariant?.price; // price_override ou null
  const maxQty = Math.max(1, Math.min(stockCount || 10, 10));

  const needsSize = hasSizes && !selectedSize;
  const needsColor = hasColors && !selectedColor;
  const needsSelection = needsSize || needsColor;
  const canAddToCart = !needsSelection && isInStock && Boolean(matchingVariant);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleAddToCart = async () => {
    if (!canAddToCart || loading) return;
    setLoading(true);
    try {
      await addToCart(matchingVariant.id, qty);
      await refresh(); // Met à jour le badge du panier dans le header.
      showFeedback("success", "Article ajouté au panier !");
    } catch (err) {
      const msg =
        typeof err.firstError === "function"
          ? err.firstError()
          : "Une erreur est survenue, veuillez réessayer.";
      showFeedback("error", msg ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = buildProductMessage({
      name: product.name,
      size: hasSizes ? selectedSize : null,
      color: hasColors ? selectedColor : null,
      qty,
      price: variantPrice ? formatPrice(variantPrice) : formatPrice(product.price),
    });
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
  };

  // ── Indicateur stock ─────────────────────────────────────────────────────────

  const stockIndicator = matchingVariant ? (
    <div className="flex items-center gap-1.5">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          !isInStock
            ? "bg-bordeaux"
            : stockCount > 3
            ? "bg-sage"
            : "bg-camel"
        }`}
        aria-hidden="true"
      />
      <span className="font-body text-sm text-taupe">
        {!isInStock
          ? "Rupture de stock"
          : stockCount <= 3
          ? `Dernières pièces (${stockCount} restante${stockCount > 1 ? "s" : ""})`
          : "En stock"}
      </span>
    </div>
  ) : null;

  // ── Rendu ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Prix de la variante si différent du prix produit */}
      {variantPrice && (
        <p className="font-body text-sm text-taupe">
          Prix pour cette variante :{" "}
          <strong className="font-bold text-espresso">{formatPrice(variantPrice)}</strong>
        </p>
      )}

      {/* Sélecteur de pointure */}
      {hasSizes && (
        <div>
          <p className="mb-2 font-body text-sm font-semibold text-espresso">
            Pointure
            {selectedSize && (
              <span className="ml-2 font-normal text-cognac">{selectedSize}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              // Vérifier si cette taille est dispo avec la couleur actuellement choisie
              const v = variants.find(
                (v) => v.size === size && (!hasColors || !selectedColor || v.color === selectedColor)
              );
              return (
                <OptionPill
                  key={size}
                  label={size}
                  active={selectedSize === size}
                  unavailable={v ? !v.in_stock : false}
                  onSelect={() => setSelectedSize(selectedSize === size ? null : size)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Sélecteur de couleur */}
      {hasColors && (
        <div>
          <p className="mb-2 font-body text-sm font-semibold text-espresso">
            Couleur
            {selectedColor && (
              <span className="ml-2 font-normal text-cognac">{selectedColor}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const v = variants.find(
                (v) =>
                  v.color === color &&
                  (!hasSizes || !selectedSize || v.size === selectedSize)
              );
              return (
                <OptionPill
                  key={color}
                  label={color}
                  active={selectedColor === color}
                  unavailable={v ? !v.in_stock : false}
                  onSelect={() =>
                    setSelectedColor(selectedColor === color ? null : color)
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Indicateur de stock */}
      {stockIndicator}

      {/* Sélecteur de quantité (affiché seulement si on peut ajouter) */}
      {canAddToCart && (
        <div>
          <p className="mb-2 font-body text-sm font-semibold text-espresso">Quantité</p>
          <div className="inline-flex items-center">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Réduire la quantité"
              className="flex h-10 w-10 items-center justify-center rounded-l-button border border-sand bg-offwhite text-espresso transition-colors hover:bg-sand disabled:opacity-40"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <output
              aria-label="Quantité sélectionnée"
              aria-live="polite"
              className="flex h-10 w-12 items-center justify-center border-y border-sand bg-offwhite font-body text-sm font-semibold text-espresso"
            >
              {qty}
            </output>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              aria-label="Augmenter la quantité"
              className="flex h-10 w-10 items-center justify-center rounded-r-button border border-sand bg-offwhite text-espresso transition-colors hover:bg-sand disabled:opacity-40"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message de retour (succès / erreur) */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-card px-4 py-3 font-body text-sm ${
            feedback.type === "success"
              ? "bg-sage/10 text-sage"
              : "bg-bordeaux/10 text-bordeaux"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Aide à la sélection */}
      {needsSelection && !feedback && (
        <p className="font-body text-xs text-taupe">
          {needsSize
            ? "Choisissez une pointure pour continuer."
            : "Choisissez une couleur pour continuer."}
        </p>
      )}

      {/*
        Boutons d'action.
        L'id "add-to-cart-anchor" est observé par MobileActionBar pour détecter
        si la zone est visible dans le viewport.
      */}
      <div id="add-to-cart-anchor" className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAddToCart || loading}
          className="flex w-full items-center justify-center rounded-button bg-espresso px-7 py-4 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sand disabled:text-taupe"
        >
          {loading
            ? "Ajout en cours…"
            : matchingVariant && !isInStock
            ? "Rupture de stock"
            : "Ajouter au panier"}
        </button>

        <div className="flex gap-3">
          <FavoriteButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: mediaUrl(product.media?.find((m) => m.type === "image")?.url, null),
            }}
          />
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex flex-1 items-center justify-center gap-2 rounded-button border border-cognac px-7 py-3.5 font-body font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Commander sur WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
