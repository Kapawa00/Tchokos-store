import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif", "pdf"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * Upload d'une preuve de paiement (image ou PDF).
 * Sauvegarde dans public/proofs/ et renvoie l'URL publique.
 * En production, remplacer par un upload vers S3/Cloudinary.
 *
 * Méthode : POST multipart/form-data avec un champ « file ».
 * Retourne : { url: string }
 */
export async function POST(request) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Requête multipart invalide." },
      { status: 400 }
    );
  }

  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).` },
      { status: 422 }
    );
  }

  const originalName = file.name ?? "proof";
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "";

  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json(
      { error: `Format non supporté. Formats acceptés : ${ALLOWED_EXT.join(", ")}.` },
      { status: 422 }
    );
  }

  const filename = `proof-${crypto.randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "proofs");
  const filepath = path.join(uploadDir, filename);

  try {
    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
  } catch (err) {
    console.error("[upload-proof] Erreur écriture fichier :", err);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du fichier." },
      { status: 500 }
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const url = `${siteUrl}/proofs/${filename}`;

  return NextResponse.json({ url });
}
