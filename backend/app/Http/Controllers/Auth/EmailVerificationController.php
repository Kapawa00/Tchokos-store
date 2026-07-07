<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * Vérifie le lien signé reçu par e-mail et marque le compte comme vérifié.
     * Redirige ensuite vers le frontend : /compte/profil?verified=1 en cas de
     * succès, ou /compte/profil?verified=0 si déjà vérifié.
     *
     * ⚠️  Cette route utilise le middleware `signed` (lien signé par HMAC).
     *     L'utilisateur doit être authentifié (`auth:sanctum`) pour que
     *     EmailVerificationRequest puisse valider le hash de l'e-mail.
     */
    public function verify(EmailVerificationRequest $request): RedirectResponse
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        if ($request->user()->hasVerifiedEmail()) {
            return redirect($frontendUrl . '/compte/profil?verified=already');
        }

        $request->fulfill(); // Appelle markEmailAsVerified() + déclenche l'événement Verified.

        return redirect($frontendUrl . '/compte/profil?verified=1');
    }

    /**
     * Renvoie l'e-mail de vérification à l'utilisateur connecté.
     * Limité à 1 envoi par minute (throttle dans les routes).
     */
    public function resend(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Votre adresse e-mail est déjà vérifiée.'], 200);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Un nouvel e-mail de vérification a été envoyé.'], 200);
    }
}
