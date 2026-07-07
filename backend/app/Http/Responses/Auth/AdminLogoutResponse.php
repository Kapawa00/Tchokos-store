<?php

namespace App\Http\Responses\Auth;

use Filament\Http\Responses\Auth\Contracts\LogoutResponse as LogoutResponseContract;
use Illuminate\Http\RedirectResponse;

/**
 * Remplace la redirection par défaut de Filament après déconnexion
 * (normalement vers /admin/login) par la page de connexion unique de la
 * vitrine : un admin ne doit voir qu'un seul écran de connexion, partagé
 * avec les clients (cf. AuthController::login() / AdminSsoController pour
 * le pont inverse, à la connexion).
 */
class AdminLogoutResponse implements LogoutResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        return redirect()->away(rtrim(config('app.frontend_url'), '/').'/compte/connexion');
    }
}
