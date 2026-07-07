"use client";

import { useState } from "react";
import { Button, Modal } from "@/components/ui";

// Démo interactive de la Modal (nécessite un état client pour ouvrir/fermer).
export default function ModalDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Ouvrir la modale</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirmer la commande">
        <p>
          Votre commande sera transmise par WhatsApp au service client de Tchokos SARL.
          Voulez-vous continuer ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={() => setIsOpen(false)}>Confirmer</Button>
        </div>
      </Modal>
    </>
  );
}
