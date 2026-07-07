import Container from "@/components/ui/Container";
import { TruckIcon, DevicePhoneIcon, WhatsAppIcon } from "@/components/icons";

const ITEMS = [
  {
    Icon: TruckIcon,
    title: "Livraison à Douala",
    text: "Expédition rapide depuis Akwa vers toute la ville.",
  },
  {
    Icon: DevicePhoneIcon,
    title: "Paiement Mobile Money",
    text: "Orange Money et MTN MoMo acceptés en toute simplicité.",
  },
  {
    Icon: WhatsAppIcon,
    title: "Service WhatsApp",
    text: "Commandez et suivez votre commande directement sur WhatsApp.",
  },
];

/**
 * Réassurance : 3 arguments clés avec icônes « brass ».
 */
export default function Reassurance() {
  return (
    <section className="border-t border-sand">
      <Container className="py-12 sm:py-14">
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {ITEMS.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brass/15 text-brass">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-espresso">
                {title}
              </h3>
              <p className="mt-1 text-sm text-taupe">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
