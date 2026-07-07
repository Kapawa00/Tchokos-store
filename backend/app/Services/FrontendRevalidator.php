<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Prévient le frontend Next.js (app/api/revalidate) qu'un ou plusieurs tags
 * ISR doivent être invalidés immédiatement, au lieu d'attendre la
 * revalidation temporisée (lib/catalog.js) — sans quoi un changement fait
 * dans l'admin Filament peut mettre jusqu'à 1h à apparaître sur le site.
 *
 * Appel synchrone volontairement : c'est le but même de la fonctionnalité
 * (effet immédiat), et un `Http::timeout()` court évite de bloquer la
 * sauvegarde admin si le frontend est indisponible.
 */
class FrontendRevalidator
{
    /**
     * @param string[] $tags
     */
    public function revalidate(array $tags): void
    {
        // Ne jamais faire de vrai appel réseau pendant les tests : ferait
        // dépendre la suite d'un serveur Next.js démarré, pour un effet de
        // bord qu'aucun test n'a besoin de vérifier.
        if (app()->environment('testing')) {
            return;
        }

        $secret = config('services.revalidate.secret');
        $tags = array_values(array_filter($tags));

        if (! $secret || empty($tags)) {
            return;
        }

        $url = rtrim(config('app.frontend_url'), '/').'/api/revalidate';

        try {
            Http::timeout(3)->post($url, [
                'secret' => $secret,
                'tags' => $tags,
            ]);
        } catch (\Throwable $e) {
            // Ne doit jamais faire échouer une sauvegarde admin : le pire
            // cas est un retour à la revalidation temporisée habituelle.
            Log::warning('Échec de la revalidation frontend ('.implode(', ', $tags).') : '.$e->getMessage());
        }
    }
}
