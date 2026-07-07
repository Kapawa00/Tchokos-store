import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Proxy server-side pour déclencher le webhook sandbox du backend.
 * Calcule le HMAC côté serveur (le secret ne doit jamais être exposé au navigateur).
 * Disponible seulement quand NEXT_PUBLIC_PAYMENT_SANDBOX=true et
 * SANDBOX_PAYMENT_WEBHOOK_SECRET est configuré.
 *
 * Corps attendu : { paymentRef: string, method: "orange_money"|"momo" }
 */
export async function POST(request) {
  if (process.env.NEXT_PUBLIC_PAYMENT_SANDBOX !== "true") {
    return NextResponse.json(
      { error: "Sandbox désactivé." },
      { status: 403 }
    );
  }

  const secret =
    process.env.SANDBOX_PAYMENT_WEBHOOK_SECRET ?? "sandbox-webhook-secret-dev";

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { paymentRef, method = "orange_money" } = body;

  if (!paymentRef) {
    return NextResponse.json(
      { error: "paymentRef manquant." },
      { status: 400 }
    );
  }

  const payload = JSON.stringify({ reference: paymentRef, status: "SUCCESS" });

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Dérive l'URL du backend depuis NEXT_PUBLIC_API_URL (supprime le /api final).
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
    "http://localhost:8000";

  const webhookUrl = `${apiBase}/api/payments/webhook/${method}`;

  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
      },
      body: payload,
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Impossible de joindre le backend.", detail: String(err) },
      { status: 502 }
    );
  }
}
