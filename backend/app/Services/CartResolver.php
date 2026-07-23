<?php

namespace App\Services;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $token = $request->header('X-Session-Token') ?: $request->input('session_token');

        if ($user) {
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);

            // Le frontend continue d'envoyer le session_token d'invité après
            // connexion (cookie non nettoyé) : sans fusion, un panier rempli
            // avant connexion devient orphelin et la commande échoue avec
            // "panier vide" alors que le résumé affiché à l'écran (rendu
            // avant coup avec l'ancien panier) montre encore les articles.
            if ($token) {
                $this->mergeGuestCartIntoUser($token, $cart);
            }

            return $cart;
        }

        if ($token) {
            return Cart::firstOrCreate(['session_token' => $token]);
        }

        return Cart::create(['session_token' => (string) Str::uuid()]);
    }

    private function mergeGuestCartIntoUser(string $token, Cart $userCart): void
    {
        $guestCart = Cart::where('session_token', $token)->with('items')->first();

        if (! $guestCart || $guestCart->id === $userCart->id) {
            return;
        }

        DB::transaction(function () use ($guestCart, $userCart) {
            foreach ($guestCart->items as $item) {
                $existing = $userCart->items()->where('variant_id', $item->variant_id)->first();

                if ($existing) {
                    $existing->increment('quantity', $item->quantity);
                } else {
                    $userCart->items()->create([
                        'variant_id' => $item->variant_id,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                    ]);
                }
            }

            $guestCart->delete();
        });
    }
}
