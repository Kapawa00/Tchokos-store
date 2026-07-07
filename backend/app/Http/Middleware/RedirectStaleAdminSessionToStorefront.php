<?php

namespace App\Http\Middleware;

use Filament\Http\Middleware\AuthenticateSession as FilamentAuthenticateSession;

/**
 * Même principe que RedirectUnauthenticatedAdminToStorefront, pour le cas où
 * la session /admin est invalidée en cours de route (ex. mot de passe changé
 * pendant la session) : redirige vers la page de connexion unique de la
 * vitrine plutôt que /admin/login.
 */
class RedirectStaleAdminSessionToStorefront extends FilamentAuthenticateSession
{
    protected function redirectTo($request): ?string
    {
        return rtrim(config('app.frontend_url'), '/').'/compte/connexion';
    }
}
