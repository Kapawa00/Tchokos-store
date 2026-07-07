import { Suspense } from "react";
import { Container } from "@/components/ui";
import { WhatsAppIcon, FacebookIcon, MapPinIcon, ClockIcon, MailIcon } from "@/components/icons";
import { SOCIAL, whatsappUrl } from "@/lib/config";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact — Tchokos SARL",
  description:
    "Contactez Tchokos SARL par WhatsApp, e-mail ou en boutique à Akwa, Douala. Nous répondons en moins d'une heure.",
  openGraph: {
    title: "Contactez Tchokos SARL",
    description: "WhatsApp, Facebook @Tchokos.sarl, ou rendez-vous à Akwa, Douala.",
  },
};

const HOURS = [
  { day: "Lundi – Vendredi", hours: "8 h 00 – 18 h 00" },
  { day: "Samedi",           hours: "8 h 00 – 17 h 00" },
  { day: "Dimanche",         hours: "Fermé" },
];

export default function ContactPage() {
  return (
    <>
      {/* ── En-tête ── */}
      <div className="border-b border-sand bg-offwhite py-12 sm:py-16">
        <Container className="text-center">
          <h1 className="font-display text-3xl font-bold text-espresso sm:text-4xl">
            Contactez-nous
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-base text-taupe">
            Notre équipe répond sur WhatsApp en moins d&apos;une heure, du lundi
            au samedi.
          </p>
        </Container>
      </div>

      <Container className="py-12 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_420px]">

          {/* ── Colonne gauche : coordonnées + carte ── */}
          <div className="space-y-8">

            {/* Bouton WhatsApp principal */}
            <a
              href={whatsappUrl("Bonjour Tchokos SARL 👋\n\nJe souhaite vous contacter.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-3 rounded-card bg-[#25D366] px-7 py-4 font-body font-semibold text-white transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon className="h-6 w-6" />
              Ouvrir la conversation WhatsApp
            </a>

            {/* Coordonnées */}
            <div className="rounded-card border border-sand bg-offwhite p-6">
              <h2 className="mb-5 font-display text-base font-semibold text-espresso">
                Nos coordonnées
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-cognac" />
                  <div>
                    <p className="font-body text-sm font-semibold text-espresso">WhatsApp & appel</p>
                    <a
                      href={whatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-sm text-cognac underline-offset-2 hover:underline"
                    >
                      +237 688 09 47 67
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <FacebookIcon className="mt-0.5 h-5 w-5 shrink-0 text-cognac" />
                  <div>
                    <p className="font-body text-sm font-semibold text-espresso">Facebook</p>
                    <a
                      href={SOCIAL.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-sm text-cognac underline-offset-2 hover:underline"
                    >
                      {SOCIAL.facebookHandle}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-cognac" />
                  <div>
                    <p className="font-body text-sm font-semibold text-espresso">E-mail</p>
                    <a
                      href="mailto:contact@tchokos.cm"
                      className="font-body text-sm text-cognac underline-offset-2 hover:underline"
                    >
                      contact@tchokos.cm
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-cognac" />
                  <div>
                    <p className="font-body text-sm font-semibold text-espresso">Adresse</p>
                    <p className="font-body text-sm text-taupe">
                      Quartier Akwa, Douala<br />
                      Cameroun
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Horaires */}
            <div className="rounded-card border border-sand bg-offwhite p-6">
              <div className="mb-4 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-cognac" />
                <h2 className="font-display text-base font-semibold text-espresso">
                  Horaires d&apos;ouverture
                </h2>
              </div>
              <table className="w-full">
                <tbody>
                  {HOURS.map(({ day, hours }) => (
                    <tr key={day} className="border-b border-sand/60 last:border-0">
                      <td className="py-2.5 font-body text-sm text-espresso">{day}</td>
                      <td className="py-2.5 text-right font-body text-sm font-semibold text-espresso">
                        {hours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Carte Google Maps */}
            <div className="overflow-hidden rounded-card border border-sand">
              <iframe
                title="Localisation Tchokos SARL — Akwa, Douala"
                src="https://maps.google.com/maps?f=q&hl=fr&geocode=&q=Akwa+Douala+Cameroun&z=15&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* ── Colonne droite : formulaire ── */}
          <div>
            <div className="rounded-card border border-sand bg-offwhite p-6 sm:p-8 lg:sticky lg:top-24">
              <h2 className="mb-6 font-display text-xl font-semibold text-espresso">
                Envoyer un message
              </h2>
              <Suspense fallback={<div className="h-64 animate-pulse rounded-card bg-sand/40" />}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
