<?php

namespace App\Listeners;

use App\Models\User;
use Illuminate\Auth\Events\Logout;

/**
 * Le panneau Filament (guard "web", session) et l'API frontend (Sanctum,
 * jeton Bearer) sont deux mécanismes d'authentification indépendants. Sans ce
 * listener, un admin qui s'était aussi connecté sur la boutique conserve un
 * jeton Sanctum valide après avoir cliqué « Se déconnecter » dans le
 * dashboard : la navbar du site continue de l'afficher comme connecté tant
 * que ce jeton n'expire pas.
 */
class RevokeTokensOnAdminLogout
{
    public function handle(Logout $event): void
    {
        if ($event->guard !== 'web' || ! $event->user instanceof User) {
            return;
        }

        $event->user->tokens()->delete();
    }
}
