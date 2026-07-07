<?php

namespace App\Listeners;

use App\Events\ProductBackInStock;
use App\Services\PushNotifier;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendBackInStockNotification implements ShouldQueue
{
    public function __construct(private readonly PushNotifier $pushNotifier)
    {
    }

    public function handle(ProductBackInStock $event): void
    {
        $variant = $event->variant->loadMissing('product');

        try {
            $this->pushNotifier->notifySubscribers(
                'De retour en stock',
                "{$variant->product->name} est de nouveau disponible.",
                ['product_slug' => $variant->product->slug],
            );
        } catch (\Throwable $e) {
            Log::warning('Échec de la notification push de retour en stock : '.$e->getMessage());
        }
    }
}
