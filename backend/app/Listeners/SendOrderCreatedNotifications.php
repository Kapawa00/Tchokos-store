<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Notifications\Orders\OrderCreatedMail;
use App\Services\PushNotifier;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Number;

class SendOrderCreatedNotifications implements ShouldQueue
{
    public function __construct(private readonly PushNotifier $pushNotifier)
    {
    }

    public function handle(OrderCreated $event): void
    {
        $order = $event->order;

        if ($order->customer_email) {
            Notification::route('mail', $order->customer_email)->notify(new OrderCreatedMail($order));
        }

        try {
            $this->pushNotifier->notifyAdmins(
                'Nouvelle commande',
                "Commande {$order->reference} — ".Number::format((float) $order->total, 0).' FCFA',
                ['reference' => $order->reference],
            );
        } catch (\Throwable $e) {
            // La notification push est secondaire : un échec (clés VAPID
            // absentes, service de push indisponible...) ne doit jamais faire
            // échouer la création de la commande.
            Log::warning('Échec de la notification push admin (nouvelle commande) : '.$e->getMessage());
        }
    }
}
