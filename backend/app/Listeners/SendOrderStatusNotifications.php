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
    public function __construct(private readonly PushNotifier $pushNotifier) {}

    public function handle(OrderStatusUpdated $event): void
    {
        $order = $event->order;

        $mail = $this->mailForStatus($order);

        if ($mail && $order->customer_email) {
            try {
                Notification::route('mail', $order->customer_email)->notify($mail);
            } catch (\Throwable $e) {
                // Voir SendOrderCreatedNotifications : un échec d'e-mail (SMTP
                // absent) ne doit jamais faire échouer le changement de
                // statut — critique ici, car ce handle() tourne à l'intérieur
                // de la transaction DB de PaymentController::webhook : sans ce
                // garde, une exception ici annule aussi la confirmation du
                // paiement elle-même.
                Log::warning('Échec de l\'e-mail de mise à jour de statut : '.$e->getMessage());
            }
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
