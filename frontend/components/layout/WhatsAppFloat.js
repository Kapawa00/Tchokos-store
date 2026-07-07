import { whatsappUrl } from "@/lib/config";
import { WhatsAppIcon } from "@/components/icons";

/**
 * Bouton WhatsApp flottant, fixé en bas à droite, présent sur toutes les pages.
 * Reste sous le menu mobile (z-index inférieur) pour ne pas le recouvrir.
 */
export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Commander sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage text-cream shadow-lg transition-transform hover:scale-105 hover:bg-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cognac focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
