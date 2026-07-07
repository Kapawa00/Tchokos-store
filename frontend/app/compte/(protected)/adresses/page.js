import { AddressBook } from "@/components/account";

export const metadata = { title: "Carnet d'adresses — Tchokos SARL" };

/**
 * Page du carnet d'adresses.
 * AddressBook est un composant client (localStorage).
 */
export default function AdressesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-espresso">Carnet d&apos;adresses</h1>
        <p className="mt-1 font-body text-sm text-taupe">
          Vos adresses de livraison enregistrées. Sélectionnez une adresse par défaut pour la réutiliser rapidement.
        </p>
      </div>
      <AddressBook />
    </div>
  );
}
