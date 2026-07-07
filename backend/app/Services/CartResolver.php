<?php

namespace App\Services;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Résout le panier de la requête courante : lié à l'utilisateur connecté
 * s'il y en a un, sinon à un session_token d'invité (en-tête
 * `X-Session-Token` ou paramètre `session_token`). Un nouveau token est
 * généré si l'invité n'en présente pas encore.
 */
class CartResolver
{
    public function resolve(Request $request): Cart
    {
        $user = $request->user('sanctum');

        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        $token = $request->header('X-Session-Token') ?: $request->input('session_token');

        if ($token) {
            return Cart::firstOrCreate(['session_token' => $token]);
        }

        return Cart::create(['session_token' => (string) Str::uuid()]);
    }
}
