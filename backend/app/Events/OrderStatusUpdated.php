<?php

namespace App\Events;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Déclenché lorsqu'un admin/gestionnaire change le statut d'une commande.
 */
class OrderStatusUpdated
{
    use Dispatchable;

    public function __construct(
        public readonly Order $order,
        public readonly OrderStatus $previousStatus,
    ) {
    }
}
