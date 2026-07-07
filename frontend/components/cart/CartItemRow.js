"use client";

import Image from "next/image";
import Link from "next/link";
import { mediaUrl, IMAGE_FALLBACK } from "@/lib/media";
import { formatPrice } from "@/lib/format";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";

/**
 * Ligne de panier : vignette, nom produit, variante, prix et contrôles quantité.
 *
 * @param {Object} props
 * @param {import("@/lib/types").CartItem} props.item
 * @param {(itemId: number, qty: number) => Promise<void>} props.onUpdate
 * @param {(itemId: number) => Promise<void>} props.onRemove
 * @param {boolean} [props.busy] - Opération en cours sur cette ligne.
 */
export default function CartItemRow({ item, onUpdate, onRemove, busy = false }) {
  const { variant, product } = item;
  const imageUrl = mediaUrl(product.image, IMAGE_FALLBACK);

  // Libellé de variante : « Pointure 40 — Noir »
  const variantLabel = [
    variant.size ? `Pointure ${variant.size}` : null,
    variant.color ?? null,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div
      className={`flex gap-4 py-5 transition-opacity ${busy ? "pointer-events-none opacity-50" : ""}`}
      aria-busy={busy}
    >
      {/* Vignette produit */}
      <Link href={`/produit/${product.slug}`} className="shrink-0">
        <Image
          src={imageUrl}
          alt={product.name}
          width={72}
          height={90}
          className="rounded-card object-cover"
          style={{ width: 72, height: 90 }}
        />
      </Link>

      {/* Infos + contrôles */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Nom */}
        <Link
          href={`/produit/${product.slug}`}
          className="font-body text-sm font-semibold leading-snug text-espresso hover:text-cognac"
        >
          {product.name}
        </Link>

        {/* Variante */}
        {variantLabel && (
          <p className="font-body text-xs text-taupe">{variantLabel}</p>
        )}

        {/* Prix unitaire */}
        <p className="font-body text-sm font-bold text-espresso">
          {formatPrice(item.unit_price)}
        </p>

        {/* Ligne basse : quantité + suppression */}
        <div className="mt-2 flex items-center justify-between">
          {/* Contrôles quantité */}
          <div className="inline-flex items-center">
            <button
              type="button"
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1 || busy}
              aria-label="Réduire la quantité"
              className="flex h-8 w-8 items-center justify-center rounded-l-button border border-sand bg-cream text-espresso transition-colors hover:bg-sand disabled:opacity-40"
            >
              <MinusIcon className="h-3 w-3" />
            </button>
            <output
              aria-label="Quantité"
              aria-live="polite"
              className="flex h-8 w-10 items-center justify-center border-y border-sand bg-cream font-body text-xs font-semibold text-espresso"
            >
              {item.quantity}
            </output>
            <button
              type="button"
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              disabled={!variant.in_stock || item.quantity >= (variant.stock || 10) || busy}
              aria-label="Augmenter la quantité"
              className="flex h-8 w-8 items-center justify-center rounded-r-button border border-sand bg-cream text-espresso transition-colors hover:bg-sand disabled:opacity-40"
            >
              <PlusIcon className="h-3 w-3" />
            </button>
          </div>

          {/* Bouton supprimer */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={busy}
            aria-label={`Supprimer ${product.name} du panier`}
            className="inline-flex items-center gap-1 font-body text-xs text-taupe transition-colors hover:text-bordeaux disabled:opacity-40"
          >
            <TrashIcon className="h-4 w-4" />
            Retirer
          </button>
        </div>

        {/* Total de la ligne */}
        <p className="text-right font-body text-xs text-taupe">
          Total : <span className="font-semibold text-espresso">{formatPrice(item.line_total)}</span>
        </p>
      </div>
    </div>
  );
}
