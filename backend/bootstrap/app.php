<?php

use App\Http\Middleware\AuthenticateOptionally;
use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Confiance au proxy inverse (Next.js en dev, nginx en prod).
        // Permet à Laravel de lire les headers X-Forwarded-Host/Port/Proto
        // et de générer les bonnes URLs même derrière un reverse proxy.
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'auth.optional' => AuthenticateOptionally::class,
        ]);

        // API 100% jeton Sanctum : aucune route web nommée "login" n'existe
        // (Filament a son propre guard/middleware séparé). Sans ceci, un
        // visiteur non authentifié dont la requête n'est pas reconnue comme
        // JSON par Laravel fait planter Authenticate::redirectTo() en 500
        // (route('login') introuvable) au lieu d'un 401 propre.
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Filet de sécurité : le handler par défaut de Laravel retombe lui
        // aussi sur route('login') pour une AuthenticationException si la
        // requête n'est pas reconnue comme JSON. Sur /api/*, on force
        // toujours une réponse JSON 401 (jamais de redirection HTML).
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => $e->getMessage()], 401);
            }
        });

        // Jeton CSRF invalide/périmé sur /admin ou /livewire (ex. onglet
        // resté ouvert au-delà de la durée de vie de la session, ou session
        // déjà invalidée) : au lieu de la page d'erreur 419 par défaut de
        // Laravel, on renvoie directement vers l'écran de connexion unique
        // de la vitrine — cohérent avec RedirectUnauthenticatedAdminToStorefront.
        // Pour les requêtes Livewire (AJAX) spécifiquement, c'est surtout le
        // hook JS de resources/views/filament/scripts/handle-session-expiry
        // qui évite la boîte de dialogue « This page has expired » de
        // Livewire ; ce handler couvre en plus les navigations directes
        // (ex. le formulaire de déconnexion, POST classique hors Livewire).
        $exceptions->render(function (TokenMismatchException $e, Request $request) {
            if ($request->is('admin/*') || $request->is('admin') || $request->is('livewire/*')) {
                return redirect()->away(rtrim(config('app.frontend_url'), '/').'/compte/connexion');
            }
        });
    })->create();
