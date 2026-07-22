import Link from "next/link";

/**
 * Encadré grossiste affiché sur la fiche produit selon le statut du compte.
 * - Approuvé   : confirmation que le tarif grossiste s'applique.
 * - En attente : information sur le traitement de la demande.
 * - Autres     : invitation à créer un compte grossiste.
 *
 * @param {Object} props
 * @param {boolean} props.isApproved  - Compte grossiste approuvé.
 * @param {boolean} props.isPending   - Demande en cours de traitement.
 */
export default function WholesaleCallout({ isApproved, isPending }) {
  if (isApproved) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-sage/40 bg-sage/8 px-4 py-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-[11px] font-bold text-cream"
        >
          ✓
        </span>
        <div>
          <p className="font-body text-sm font-semibold text-espresso">
            Tarif grossiste appliqué
          </p>
          <p className="mt-0.5 font-body text-xs text-taupe">
            Le prix affiché correspond à votre tarif grossiste exclusif.
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="rounded-card border border-camel/40 bg-camel/8 px-4 py-3">
        <p className="font-body text-sm font-semibold text-espresso">
          Demande grossiste en cours
        </p>
        <p className="mt-0.5 font-body text-xs text-taupe">
          Votre dossier est en cours d{"'"}examen. Vous serez notifié(e) dès sa validation.
        </p>
      </div>
    );
  }

  // Visiteur, client non grossiste → CTA pour rejoindre le programme
  return (
    <div className="rounded-card border border-sand bg-offwhite px-4 py-4">
      <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-taupe">
        Vente en gros
      </p>
      <p className="mt-1 font-body text-sm text-espresso">
        Vous achetez en quantité ? Accédez à nos{" "}
        <strong className="font-semibold">tarifs grossistes</strong> dédiés aux
        revendeurs et boutiques.
      </p>
      <Link
        href="/vente-en-gros"
        className="mt-3 inline-flex items-center gap-1 font-body text-sm font-medium text-cognac transition-colors hover:text-espresso focus-visible:outline-none focus-visible:underline"
      >
        Voir les tarifs en gros
        <span aria-hidden="true"> →</span>
      </Link>
    </div>
  );
}
