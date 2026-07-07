<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Collection;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

/**
 * Envoie des notifications Web Push (VAPID, sans Firebase) via
 * minishlink/web-push. Les abonnements expirés ou révoqués (signalés par le
 * service de push lors de l'envoi) sont supprimés automatiquement.
 */
class PushNotifier
{
    public function __construct(private readonly WebPush $webPush)
    {
    }

    /**
     * Notifie un utilisateur précis (ex. changement de statut de sa commande).
     */
    public function notifyUser(User $user, string $title, string $body, array $data = []): void
    {
        $this->send($user->pushSubscriptions()->get(), $title, $body, $data);
    }

    /**
     * Notifie les administrateurs/gestionnaires (ex. nouvelle commande).
     */
    public function notifyAdmins(string $title, string $body, array $data = []): void
    {
        $adminIds = User::whereIn('role', [UserRole::Admin->value, UserRole::Manager->value])->pluck('id');

        $this->send(
            PushSubscription::whereIn('user_id', $adminIds)->get(),
            $title,
            $body,
            $data,
        );
    }

    /**
     * Notifie tous les abonnés aux notifications push (ex. retour en stock).
     */
    public function notifySubscribers(string $title, string $body, array $data = []): void
    {
        $this->send(PushSubscription::all(), $title, $body, $data);
    }

    /**
     * @param  Collection<int, PushSubscription>  $subscriptions
     */
    private function send(Collection $subscriptions, string $title, string $body, array $data): void
    {
        if ($subscriptions->isEmpty()) {
            return;
        }

        $payload = json_encode(['title' => $title, 'body' => $body, 'data' => $data], JSON_THROW_ON_ERROR);

        foreach ($subscriptions as $subscription) {
            $this->webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $subscription->endpoint,
                    'keys' => [
                        'p256dh' => $subscription->p256dh,
                        'auth' => $subscription->auth,
                    ],
                ]),
                $payload,
            );
        }

        foreach ($this->webPush->flush() as $report) {
            if (! $report->isSuccess() && $report->isSubscriptionExpired()) {
                PushSubscription::where('endpoint', $report->getEndpoint())->delete();
            }
        }
    }
}
