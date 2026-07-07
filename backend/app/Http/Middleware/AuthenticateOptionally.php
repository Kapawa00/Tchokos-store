<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authentifie via Sanctum si un jeton Bearer est fourni, sans bloquer les
 * invités. Utilisé sur les routes publiques du catalogue dont le prix
 * affiché dépend du rôle de l'utilisateur (détail vs gros).
 */
class AuthenticateOptionally
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken() && Auth::guard('sanctum')->check()) {
            Auth::shouldUse('sanctum');
        }

        return $next($request);
    }
}
