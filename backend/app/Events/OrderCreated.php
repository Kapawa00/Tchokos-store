<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Déclenché à la création d'une commande. Écouté par
 * App\Listeners\SendOrderCreatedNotifications (e-mail de récap au client +
 * notification push aux admins).
 */
class OrderCreated
{
    use Dispatchable;

    public function __construct(public readonly Order $order)
    {
    }
}
