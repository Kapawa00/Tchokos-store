<?php

namespace App\Http\Controllers\Concerns;

use App\Enums\UserRole;
use App\Models\Order;
use Illuminate\Http\Request;

/**
 * Contrôle d'accès partagé à une commande : son propriétaire,
 * l'admin/gestionnaire, ou un invité prouvant son identité (téléphone ou
 * e-mail correspondant à la commande).
 */
trait AuthorizesOrderAccess
{
    private function authorizeOrderAccess(Request $request, Order $order): void
    {
        $user = $request->user('sanctum');

        if ($user && in_array($user->role, [UserRole::Admin, UserRole::Manager], true)) {
            return;
        }

        if ($user && $order->user_id === $user->id) {
            return;
        }

        if ($order->user_id === null) {
            $phone = $request->input('phone', $request->query('phone'));
            $email = $request->input('email', $request->query('email'));

            if (($phone && $phone === $order->customer_phone) || ($email && $email === $order->customer_email)) {
                return;
            }
        }

        abort(403, "Vous n'avez pas accès à cette commande.");
    }
}
