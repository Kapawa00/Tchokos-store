<?php

namespace App\Http\Controllers\Push;

use App\Http\Controllers\Controller;
use App\Http\Requests\Push\SubscribePushRequest;
use App\Http\Requests\Push\UnsubscribePushRequest;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushController extends Controller
{
    /**
     * Enregistre (ou met à jour) un abonnement push du navigateur courant.
     * Rattaché à l'utilisateur connecté si authentifié, sinon anonyme.
     */
    public function subscribe(SubscribePushRequest $request): JsonResponse
    {
        $user = $request->user('sanctum');
        $data = $request->validated();

        PushSubscription::updateOrCreate(
            ['endpoint' => $data['endpoint']],
            [
                'user_id' => $user?->id,
                'p256dh' => $data['keys']['p256dh'],
                'auth' => $data['keys']['auth'],
            ],
        );

        return response()->json(['message' => 'Abonnement push enregistré.']);
    }

    /**
     * Supprime un abonnement push (ex. désactivation des notifications par
     * l'utilisateur, ou nettoyage avant un nouvel abonnement du navigateur).
     */
    public function unsubscribe(UnsubscribePushRequest $request): JsonResponse
    {
        PushSubscription::where('endpoint', $request->validated('endpoint'))->delete();

        return response()->json(['message' => 'Abonnement push supprimé.']);
    }
}
