import { PushToggle } from "@/components/account";
import { BellIcon } from "@/components/icons";

export const metadata = { title: "Notifications — Tchokos SARL" };

/**
 * Page des paramètres de notifications push.
 * PushToggle gère l'enregistrement du Service Worker et l'abonnement.
 */
export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-espresso">Notifications</h1>
        <p className="mt-1 font-body text-sm text-taupe">
          Recevez des alertes en temps réel sur l&apos;état de vos commandes.
        </p>
      </div>

      <div className="rounded-card border border-sand bg-offwhite p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso/10">
            <BellIcon className="h-5 w-5 text-espresso" />
          </div>
          <div>
            <h2 className="font-body text-sm font-semibold text-espresso">Notifications push</h2>
            <p className="font-body text-xs text-taupe">
              Alertes de livraison, confirmation de paiement, promotions.
            </p>
          </div>
        </div>
        <PushToggle />
      </div>
    </div>
  );
}
