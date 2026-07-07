import { ClockIcon, CheckCircleIcon } from "@/components/icons";

/** @type {Record<import("@/lib/types").WholesaleStatus, { label: string, desc: string, color: string, Icon: any }>} */
const STATUS_UI = {
  pending: {
    label: "Demande en cours d'examen",
    desc: "Notre équipe examine votre demande. Vous serez notifié(e) par e-mail dès qu'une décision sera prise (généralement sous 48 h ouvrées).",
    color: "border-camel/30 bg-camel/5 text-camel",
    Icon: ClockIcon,
  },
  approved: {
    label: "Compte grossiste actif",
    desc: "Félicitations ! Votre compte grossiste a été approuvé. Connectez-vous pour voir les prix de gros directement sur les fiches produit.",
    color: "border-sage/30 bg-sage/5 text-sage",
    Icon: CheckCircleIcon,
  },
  rejected: {
    label: "Demande non retenue",
    desc: "Votre demande n'a pas été acceptée pour l'instant. Vous pouvez soumettre une nouvelle demande avec des informations complémentaires.",
    color: "border-bordeaux/30 bg-bordeaux/5 text-bordeaux",
    Icon: ClockIcon,
  },
  none: {
    label: "",
    desc: "",
    color: "",
    Icon: null,
  },
};

/**
 * Affichage du statut de la demande grossiste.
 * @param {{ account: import("@/lib/types").WholesaleAccount }} props
 */
export default function WholesaleStatus({ account }) {
  const status = account?.status ?? "none";
  if (status === "none") return null;

  const { label, desc, color, Icon } = STATUS_UI[status];

  return (
    <div className={`rounded-card border px-5 py-4 ${color}`}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0" />}
        <div>
          <p className="font-body text-sm font-semibold">{label}</p>
          <p className="mt-1 font-body text-sm opacity-80">{desc}</p>
        </div>
      </div>
      {account.company && (
        <dl className="mt-4 grid gap-1 border-t border-current/20 pt-3 text-xs opacity-70">
          <div className="flex gap-2">
            <dt className="font-semibold">Société :</dt>
            <dd>{account.company}</dd>
          </div>
          {account.city && (
            <div className="flex gap-2">
              <dt className="font-semibold">Ville :</dt>
              <dd>{account.city}</dd>
            </div>
          )}
          {account.item_type && (
            <div className="flex gap-2">
              <dt className="font-semibold">Articles :</dt>
              <dd>{account.item_type}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
