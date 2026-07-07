import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Webhook appelé par le backend Laravel (voir FrontendRevalidator) à chaque
 * création/modification/suppression d'un produit, d'une catégorie, d'un
 * média ou d'une promotion dans l'admin Filament. Invalide immédiatement le
 * cache ISR correspondant au lieu d'attendre la revalidation temporisée
 * (lib/catalog.js).
 *
 * Corps attendu : { secret: string, tags: string[] }
 */
export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body?.secret || body.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  // { expire: 0 } force une expiration immédiate (et non le
  // stale-while-revalidate de "max") : un webhook doit invalider tout de
  // suite, l'admin ne doit pas revoir l'ancienne version une dernière fois.
  const tags = Array.isArray(body.tags) ? body.tags.filter(Boolean) : [];
  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));

  return NextResponse.json({ revalidated: true, tags });
}
