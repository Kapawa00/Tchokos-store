<?php

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderStatusUpdated;
use App\Models\Order;
use App\Notifications\Orders\OrderDeliveredMail;
use App\Notifications\Orders\OrderShippedMail;
use App\Notifications\Orders\PaymentConfirmedMail;
use App\Services\PushNotifier;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification as NotificationBase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendOrderStatusNotifications implements ShouldQueue
{
    public function __construct(private readonly PushNotifier $pushNotifier)
    {
    }

    public function handle(OrderStatusUpdated $event): void
    {
        $order = $event->order;

        $mail = $this->mailForStatus($order);

        if ($mail && $order->customer_email) {
            Notification::route('mail', $order->customer_email)->notify($mail);
        }

        if ($order->user) {
            try {
                $this->pushNotifier->notifyUser(
                    $order->user,
                    'Mise à jour de votre commande',
                    "Commande {$order->reference} : {$order->status->label()}",
                    ['reference' => $order->reference, 'status' => $order->status->value],
                );
            } catch (\Throwable $e) {
                // Voir SendOrderCreatedNotifications : la notification push ne
                // doit jamais bloquer le changement de statut lui-même.
                Log::warning('Échec de la notification push client (statut commande) : '.$e->getMessage());
            }
        }
    }

    private function mailForStatus(Order $order): ?NotificationBase
    {
        return match ($order->status) {
            OrderStatus::Paid => new PaymentConfirmedMail($order),
            OrderStatus::Shipped => new OrderShippedMail($order),
            OrderStatus::Delivered => new OrderDeliveredMail($order),
            default => null,
        };
    }
}
