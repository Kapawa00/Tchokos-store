"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initiatePayment, fetchOrderStatus } from "@/lib/payments";
import { CheckCircleIcon } from "@/components/icons";
import Spinner from "./Spinner";

const IS_SANDBOX = process.env.NEXT_PUBLIC_PAYMENT_SANDBOX === "true";
const POLL_INTERVAL_MS = 5_000;
const POLL_MAX_ATTEMPTS = 120; // 10 minutes

/** @typedef {"idle"|"initiating"|"pending"|"paid"|"failed"|"timeout"} OmStatus */

/**
 * Flux de paiement Orange Money ou MTN MoMo.
 * États : idle → initiating → pending (+ polling) → paid | failed | timeout.
 *
 * @param {Object} props
 * @param {string} props.reference - Référence de la commande.
 * @param {"orange_money"|"momo"} props.method
 * @param {string|null} [props.phone] - Téléphone du client (vérification invité).
 * @param {() => void} [props.onPaid] - Appelé quand le polling confirme le paiement.
 * @param {() => void} props.onBack - Retour au sélecteur de méthode.
 */
export default function OmMomoPayment({ reference, method, phone, onPaid, onBack }) {
  const [status, setStatus] = useState(/** @type {OmStatus} */ ("idle"));
  const [paymentRef, setPaymentRef] = useState(/** @type {string|null} */ (null));
  const [redirectUrl, setRedirectUrl] = useState(/** @type {string|null} */ (null));
  const [instructions, setInstructions] = useState(/** @type {string|null} */ (null));
  const [errorMsg, setErrorMsg] = useState("");
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);

  const intervalRef = useRef(/** @type {ReturnType<typeof setInterval>|null} */ (null));

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startPolling = useCallback(() => {
    let attempts = 0;
    intervalRef.current = setInterval(async () => {
      attempts += 1;
      setPollAttempts(attempts);

      if (attempts > POLL_MAX_ATTEMPTS) {
        stopPolling();
        setStatus("timeout");
        return;
      }

      try {
        const order = await fetchOrderStatus(reference, { phone: phone ?? undefined });
        if (order?.status === "paid") {
          stopPolling();
          setStatus("paid");
          onPaid?.();
        } else if (order?.status === "cancelled") {
          stopPolling();
          setStatus("failed");
          setErrorMsg("La commande a été annulée.");
        }
      } catch {
        // Erreur réseau — on continue le polling sans interrompre.
      }
    }, POLL_INTERVAL_MS);
  }, [reference, phone, onPaid, stopPolling]);

  const handleInitiate = async () => {
    setStatus("initiating");
    setErrorMsg("");
    try {
      const result = await initiatePayment(reference, method);
      setPaymentRef(result.payment_ref ?? null);
      setRedirectUrl(result.redirect_url ?? null);
      setInstructions(result.instructions ?? null);
      setStatus("pending");
      if (result.redirect_url) {
        window.open(result.redirect_url, "_blank", "noopener,noreferrer");
      }
      startPolling();
    } catch (err) {
      const msg =
        typeof err.firstError === "function"
          ? err.firstError()
          : err?.message ?? null;
      setErrorMsg(msg ?? "Impossible d'initier le paiement. Veuillez réessayer.");
      setStatus("failed");
    }
  };

  /** Déclenche le webhook sandbox via la route Next.js (secret côté serveur). */
  const handleSandboxConfirm = async () => {
    if (!paymentRef) return;
    setSandboxLoading(true);
    try {
      const resp = await fetch("/api/sandbox-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentRef, method }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        console.warn("[sandbox-confirm]", data);
      }
      // Le polling détectera le changement de statut dans les 5 secondes.
    } catch (err) {
      console.error("[sandbox-confirm] Erreur réseau :", err);
    } finally {
      setSandboxLoading(false);
    }
  };

  const handleRetry = () => {
    stopPolling();
    setStatus("idle");
    setPaymentRef(null);
    setRedirectUrl(null);
    setInstructions(null);
    setErrorMsg("");
    setPollAttempts(0);
  };

  const methodLabel = method === "orange_money" ? "Orange Money" : "MTN MoMo";
  const methodAccent =
    method === "orange_money" ? "text-orange-500" : "text-yellow-600";
  const methodBadgeBg =
    method === "orange_money"
      ? "bg-orange-50 border-orange-200 text-orange-600"
      : "bg-yellow-50 border-yellow-200 text-yellow-700";

  // ── Écran succès ────────────────────────────────────────────────────────────
  if (status === "paid") {
    return (
      <div className="rounded-card bg-sage/10 p-8 text-center">
        <CheckCircleIcon className="mx-auto mb-4 h-14 w-14 text-sage" />
        <p className="font-display text-xl font-semibold text-espresso">
          Paiement confirmé !
        </p>
        <p className="mt-2 font-body text-sm text-taupe">
          Votre commande <strong className="text-espresso">{reference}</strong>{" "}
          est en cours de traitement. Vous recevrez une notification sous peu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* En-tête méthode */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 font-body text-xs font-semibold ${methodBadgeBg}`}
        >
          {methodLabel}
        </span>
        {(status === "idle" || status === "failed" || status === "timeout") && (
          <button
            type="button"
            onClick={onBack}
            className="font-body text-xs text-taupe underline-offset-2 hover:text-cognac hover:underline"
          >
            ← Changer
          </button>
        )}
      </div>

      {/* ── Idle ─────────────────────────────────────────────────────────── */}
      {status === "idle" && (
        <div className="space-y-3">
          <p className="font-body text-sm text-taupe">
            Cliquez ci-dessous pour démarrer le paiement via {methodLabel}. Vous
            recevrez les instructions pour finaliser le virement.
          </p>
          <button
            type="button"
            onClick={handleInitiate}
            className={`w-full rounded-button px-7 py-4 font-body font-medium text-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac ${
              method === "orange_money"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            Payer avec {methodLabel}
          </button>
        </div>
      )}

      {/* ── Initiating ───────────────────────────────────────────────────── */}
      {status === "initiating" && (
        <div className="flex items-center justify-center gap-3 py-10">
          <Spinner />
          <p className="font-body text-sm text-taupe">Connexion à {methodLabel}…</p>
        </div>
      )}

      {/* ── Pending ──────────────────────────────────────────────────────── */}
      {status === "pending" && (
        <div className="space-y-4">
          {/* Référence de paiement */}
          {paymentRef && (
            <div className="rounded-card bg-sand/40 px-4 py-3">
              <p className="font-body text-[11px] uppercase tracking-widest text-taupe">
                Référence de paiement
              </p>
              <p className="mt-1 font-mono text-sm font-bold tracking-wider text-espresso">
                {paymentRef}
              </p>
            </div>
          )}

          {/* Instructions opérateur */}
          {instructions && (
            <div className="rounded-card border border-sand bg-offwhite p-4">
              <p className="font-body text-sm leading-relaxed text-espresso whitespace-pre-wrap">
                {instructions}
              </p>
            </div>
          )}

          {/* Bouton redirection opérateur (production) */}
          {redirectUrl && (
            <a
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex w-full items-center justify-center rounded-button px-7 py-3.5 font-body font-medium text-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac ${
                method === "orange_money"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              Finaliser le paiement ↗
            </a>
          )}

          {/* Indicateur de polling */}
          <div className="flex items-center gap-3 rounded-card bg-camel/8 px-4 py-3">
            <Spinner small />
            <p className="font-body text-xs text-taupe">
              En attente de confirmation…{" "}
              <span className="text-taupe/60">
                ({Math.min(pollAttempts * POLL_INTERVAL_MS / 1000, POLL_MAX_ATTEMPTS * POLL_INTERVAL_MS / 1000)}s)
              </span>
            </p>
          </div>

          {/* ── Bloc sandbox ── */}
          {IS_SANDBOX && (
            <div className="rounded-card border border-dashed border-camel/60 bg-camel/5 p-4">
              <p className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-camel">
                ⚙ Mode test — sandbox
              </p>
              <p className="mb-3 font-body text-xs text-taupe">
                Aucun vrai paiement ne sera effectué. Cliquez pour simuler la
                confirmation par l&apos;opérateur.
              </p>
              <button
                type="button"
                onClick={handleSandboxConfirm}
                disabled={sandboxLoading}
                className="inline-flex items-center gap-2 rounded-button border border-camel px-4 py-2 font-body text-xs font-semibold text-espresso transition-colors hover:bg-camel hover:text-cream disabled:opacity-50"
              >
                {sandboxLoading ? (
                  <>
                    <Spinner small /> Simulation…
                  </>
                ) : (
                  "✓ Simuler paiement reçu"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Timeout ──────────────────────────────────────────────────────── */}
      {status === "timeout" && (
        <div className="space-y-4 rounded-card border border-sand bg-offwhite p-5 text-center">
          <p className="font-body text-sm text-taupe">
            La vérification automatique a expiré. Si vous avez effectué le virement,
            votre paiement sera validé sous peu par notre équipe.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-button border border-cognac px-5 py-2.5 font-body text-sm font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          >
            Relancer la vérification
          </button>
        </div>
      )}

      {/* ── Failed ───────────────────────────────────────────────────────── */}
      {status === "failed" && (
        <div className="space-y-4">
          <div className="rounded-card border border-bordeaux/30 bg-bordeaux/5 px-4 py-3">
            <p className="font-body text-sm text-bordeaux">
              {errorMsg || "Le paiement a échoué ou a été annulé."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="w-full rounded-button border border-cognac px-7 py-3 font-body font-medium text-espresso transition-colors hover:bg-cognac hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}
