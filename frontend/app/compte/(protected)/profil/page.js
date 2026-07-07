// Page profil : Server Component pour les métadonnées + récupération du user.
// Le formulaire est délégué à ProfilClient (client component).
import { getServerUser } from "@/lib/api.server";
import ProfilClient from "./ProfilClient";

export const metadata = { title: "Profil — Tchokos SARL" };
export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await getServerUser();
  return <ProfilClient initialUser={user} />;
}
