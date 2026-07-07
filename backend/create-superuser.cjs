/**
 * Tchokos SARL — Création du super-utilisateur (back-office Filament)
 *
 * Renseignez les informations via des variables d'environnement puis exécutez :
 *   SUPERUSER_EMAIL=admin@exemple.cm SUPERUSER_PASSWORD='...' node create-superuser.cjs
 *
 * Ou placez-les dans un fichier .env.superuser (non versionné, cf. .gitignore) :
 *   SUPERUSER_NAME=Admin Tchokos
 *   SUPERUSER_EMAIL=admin@exemple.cm
 *   SUPERUSER_PHONE=237699000001
 *   SUPERUSER_PASSWORD=...
 * puis : node -r dotenv/config create-superuser.cjs dotenv_config_path=.env.superuser
 *
 * Ce script appelle PHP pour créer (ou mettre à jour) le compte administrateur
 * sans passer par l'interface web. Il peut être relancé en toute sécurité : si
 * le compte existe déjà, seuls le nom et le mot de passe sont mis à jour
 * (l'e-mail reste inchangé, il est la clé d'identification).
 *
 * ⚠️ Ne jamais mettre d'e-mail/mot de passe réel en dur ici : ce fichier est
 * versionné (cf. CLAUDE.md — secrets toujours via .env, jamais dans le code).
 */

const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs   = require("fs");

// ─── Informations du super-utilisateur (depuis l'environnement) ─────────────

const SUPERUSER = {
  name:     process.env.SUPERUSER_NAME || "Admin Tchokos",
  email:    process.env.SUPERUSER_EMAIL,
  phone:    process.env.SUPERUSER_PHONE || "",
  password: process.env.SUPERUSER_PASSWORD,
};

if (!SUPERUSER.email || !SUPERUSER.password) {
  console.error("✗ SUPERUSER_EMAIL et SUPERUSER_PASSWORD sont obligatoires.");
  console.error("");
  console.error("  Exemple :");
  console.error("    SUPERUSER_EMAIL=admin@exemple.cm SUPERUSER_PASSWORD='...' node create-superuser.cjs");
  process.exit(1);
}

const backendDir = path.resolve(__dirname);

/** Échappe les apostrophes et backslashes pour l'injection PHP entre guillemets simples. */
function esc(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// Script PHP écrit dans un fichier temporaire (évite les problèmes de shell-escaping
// liés aux use-statements dans PsySH / --execute).
const phpScript = `<?php
require_once '${esc(backendDir.replace(/\\/g, "/"))}/vendor/autoload.php';
$app = require_once '${esc(backendDir.replace(/\\/g, "/"))}/bootstrap/app.php';
$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();

$user = \\App\\Models\\User::firstOrNew(['email' => '${esc(SUPERUSER.email)}']);
$user->name              = '${esc(SUPERUSER.name)}';
$user->phone             = '${esc(SUPERUSER.phone)}';
$user->password          = \\Illuminate\\Support\\Facades\\Hash::make('${esc(SUPERUSER.password)}');
$user->role              = \\App\\Enums\\UserRole::Admin;
$user->email_verified_at = $user->email_verified_at ?? now();
$user->save();

echo $user->wasRecentlyCreated ? 'Compte créé.' : 'Compte mis à jour.';
`;

const tmpFile = path.join(backendDir, "__create_superuser_tmp.php");

console.log("╔══════════════════════════════════════════════╗");
console.log("║   Tchokos SARL — Super-utilisateur admin     ║");
console.log("╚══════════════════════════════════════════════╝");
console.log(`  Nom    : ${SUPERUSER.name}`);
console.log(`  E-mail : ${SUPERUSER.email}`);
console.log(`  Rôle   : admin (accès Filament /admin)`);
console.log("");

try {
  fs.writeFileSync(tmpFile, phpScript, "utf8");

  const result = spawnSync("php", [tmpFile], {
    cwd: backendDir,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Erreur PHP inconnue.");
  }

  console.log(`✓ ${(result.stdout || "").trim()}`);
  console.log("");
  console.log("Accédez au back-office :");
  console.log("  URL           : http://localhost:8000/admin");
  console.log(`  E-mail        : ${SUPERUSER.email}`);
  console.log("  Mot de passe  : (celui défini dans SUPERUSER.password)");
} catch (err) {
  console.error("✗ Erreur :", err.message.trim());
  process.exit(1);
} finally {
  // Supprime toujours le fichier temporaire.
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}
