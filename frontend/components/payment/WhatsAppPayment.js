"use client";

import { useRef, useState } from "react";
import { submitWhatsappProof } from "@/lib/payments";
import { buildWhatsAppLink, buildOrderMessage } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { WhatsAppIcon, CheckCircleIcon } from "@/components/icons";
import Spinner from "./Spinner";

const MERCHANT_OM_NUMBER =
  process.env.NEXT_PUBLIC_MERCHANT_OM_NUMBER ?? null;
const MERCHANT_MOMO_NUMBER =
  process.env.NEXT_PUBLIC_MERCHANT_MOMO_NUMBER ?? null;

/**
 * Formate un numéro de téléphone camerounais pour l'affichage.
 * 237688094767 → 237 688 09 47 67
 * @param {string} num
 */
function fmtPhone(num) {
  const d = num.replace(/\D/g, "");
  if (d.length === 12) {
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  }
  return num;
}

/**
 * Flux de paiement assisté via WhatsApp.
 * Étapes : informations de virement → preuve → confirmation.
 *
 * @param {Object} props
 * @param {string} props.reference - Référence de la commande.
 * @param {import("@/lib/types").Order|null} props.order - Commande (pour le message WA).
 * @param {() => void} props.onBack
 */
export default function WhatsAppPayment({ reference, order, onBack }) {
  const [step, setStep] = useState(/** @type {"info"|"proof"|"done"} */ ("info"));
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(/** @type {HTMLInputElement|null} */ (null));

  const waHref = order
    ? buildWhatsAppLink(buildOrderMessage(order))
    : buildWhatsAppLink(
        `Bonjour Tchokos SARL 👋\n\nJe souhaite finaliser ma commande *N° ${reference}*.\n\nMerci !`
      );

  // ── Upload fichier → /api/upload-proof → URL ────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch("/api/upload-proof", { method: "POST", body: fd });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error ?? "Erreur lors de l'upload.");
      }
      setProofUrl(data.url);
    } catch (err) {
      setError(err.message ?? "Impossible d'envoyer le fichier.");
    } finally {
      setUploading(false);
    }
  };

  // ── Soumission de la preuve ─────────────────────────────────────────────────
  const handleSubmitProof = async () => {
    if (!proofUrl.trim()) {
      setError("Veuillez fournir un lien ou télécharger votre preuve.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitWhatsappProof(reference, proofUrl.trim());
      setStep("done");
    } catch (err) {
      const msg =
        typeof err.firstError === "function" ? err.firstError() : err?.message;
      setError(msg ?? "Impossible d'envoyer la preuve. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Étape : succès ──────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="rounded-card bg-sage/10 p-8 text-center">
        <CheckCircleIcon className="mx-auto mb-4 h-14 w-14 text-sage" />
        <p className="font-display text-xl font-semibold text-espresso">
          Preuve envoyée !
        </p>
        <p className="mt-2 font-body text-sm text-taupe">
          Notre équipe validera votre paiement sous 24 h ouvrées. Vous serez
          notifié(e) dès confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage/10 px-3 py-1 font-body text-xs font-semibold text-sage">
          <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
        </span>
        <button
          type="button"
          onClick={onBack}
          className="font-body text-xs text-taupe underline-offset-2 hover:text-cognac hover:underline"
        >
          ← Changer
        </button>
      </div>

      {/* ── Étape 1 : infos de virement ──────────────────────────────────── */}
      {step === "info" && (
        <div className="space-y-5">
          <div className="rounded-card border border-sand bg-offwhite p-5">
            <p className="mb-3 font-body text-sm font-semibold text-espresso">
              Effectuez votre virement vers l&apos;un de ces numéros :
            </p>

            <ul className="space-y-2">
              {MERCHANT_OM_NUMBER && !MERCHANT_OM_NUMBER.includes("X") ? (
                <li className="flex items-center gap-3">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                  <span className="font-body text-sm text-espresso">
                    <strong>Orange Money</strong> :{" "}
                    <span className="font-mono tracking-wider">
                      {fmtPhone(MERCHANT_OM_NUMBER)}
                    </span>
                  </span>
                </li>
              ) : null}

              {MERCHANT_MOMO_NUMBER && !MERCHANT_MOMO_NUMBER.includes("X") ? (
                <li className="flex items-center gap-3">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="font-body text-sm text-espresso">
                    <strong>MTN MoMo</strong> :{" "}
                    <span className="font-mono tracking-wider">
                      {fmtPhone(MERCHANT_MOMO_NUMBER)}
                    </span>
                  </span>
                </li>
              ) : null}

              {/* Fallback si numéros non configurés */}
              {(!MERCHANT_OM_NUMBER ||
                MERCHANT_OM_NUMBER.includes("X")) &&
                (!MERCHANT_MOMO_NUMBER ||
                  MERCHANT_MOMO_NUMBER.includes("X")) && (
                  <li className="font-body text-sm italic text-taupe">
                    Contactez-nous sur WhatsApp pour obtenir le numéro de
                    virement.
                  </li>
                )}
            </ul>

            {order && (
              <div className="mt-4 border-t border-sand pt-3">
                <p className="font-body text-xs text-taupe">
                  Montant à virer :{" "}
                  <strong className="text-espresso">
                    {formatPrice(order.subtotal)}
                  </strong>{" "}
                  + frais de livraison
                </p>
                <p className="font-body text-xs text-taupe">
                  Référence à indiquer : <strong className="text-espresso">{reference}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Bouton WA pour contacter directement */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-button bg-sage px-7 py-3.5 font-body font-medium text-cream transition-colors hover:bg-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Contacter sur WhatsApp
          </a>

          <p className="text-center font-body text-xs text-taupe">
            Après le virement, envoyez la preuve ici ou directement sur WhatsApp.
          </p>

          <button
            type="button"
            onClick={() => setStep("proof")}
            className="w-full rounded-button border border-cognac px-7 py-3 font-body font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          >
            J&apos;ai effectué le virement → Envoyer la preuve
          </button>
        </div>
      )}

      {/* ── Étape 2 : envoi de la preuve ─────────────────────────────────── */}
      {step === "proof" && (
        <div className="space-y-4">
          <p className="font-body text-sm text-taupe">
            Téléchargez une capture d&apos;écran de votre confirmation de virement
            (SMS, notification d&apos;application), ou collez le lien direct vers votre
            preuve.
          </p>

          {/* Zone d'upload fichier */}
          <div>
            <label className="mb-1.5 block font-body text-sm font-semibold text-espresso">
              Télécharger la preuve
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-sand bg-offwhite px-4 py-6 transition-colors hover:border-cognac hover:bg-cognac/5"
            >
              {uploading ? (
                <>
                  <Spinner />
                  <p className="font-body text-xs text-taupe">Upload en cours…</p>
                </>
              ) : proofUrl ? (
                <>
                  <CheckCircleIcon className="h-6 w-6 text-sage" />
                  <p className="font-body text-xs text-sage">Fichier téléchargé ✓</p>
                </>
              ) : (
                <>
                  <span className="font-body text-xs text-taupe">
                    Cliquez pour sélectionner un fichier
                  </span>
                  <span className="font-body text-[10px] text-taupe/60">
                    JPG, PNG, PDF — max 5 Mo
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>

          {/* OU : saisie manuelle d'URL */}
          <div>
            <label
              htmlFor="proof-url"
              className="mb-1.5 block font-body text-sm font-semibold text-espresso"
            >
              Ou collez un lien vers votre preuve
            </label>
            <input
              id="proof-url"
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-button border border-sand bg-offwhite px-4 py-3 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso"
            />
          </div>

          {error && (
            <p className="font-body text-xs text-bordeaux" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("info")}
              className="rounded-button border border-sand px-4 py-3 font-body text-sm text-taupe transition-colors hover:border-taupe"
            >
              ← Retour
            </button>
            <button
              type="button"
              onClick={handleSubmitProof}
              disabled={submitting || uploading || !proofUrl.trim()}
              className="flex-1 rounded-button bg-espresso px-7 py-3 font-body font-medium text-cream transition-colors hover:bg-cognac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner small /> Envoi…
                </span>
              ) : (
                "Envoyer la preuve"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
