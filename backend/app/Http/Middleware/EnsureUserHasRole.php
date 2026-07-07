<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Protège les routes réservées à certains rôles, ex. `role:admin,manager`.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role->value, $roles, true)) {
            return response()->json([
                'message' => "Vous n'avez pas les droits nécessaires pour accéder à cette ressource.",
            ], 403);
        }

        return $next($request);
    }
}
