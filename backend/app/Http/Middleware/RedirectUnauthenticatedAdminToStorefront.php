<?php

namespace App\Http\Middleware;

use Filament\Http\Middleware\Authenticate as FilamentAuthenticate;

/**
 * Un seul écran de connexion (vitrine) : un visiteur non authentifié (ou dont
 * la session a expiré) sur /admin est renvoyé vers /compte/connexion plutôt
 * que la page de login par défaut de Filament (/admin/login). Le pont
 * inverse (connexion → session Filament) reste géré par AdminSsoController.
 */
class RedirectUnauthenticatedAdminToStorefront extends FilamentAuthenticate
{
    protected function redirectTo($request): ?string
    {
        return rtrim(config('app.frontend_url'), '/').'/compte/connexion';
    }
}
