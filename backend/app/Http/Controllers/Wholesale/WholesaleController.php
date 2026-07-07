<?php

namespace App\Http\Controllers\Wholesale;

use App\Enums\UserRole;
use App\Enums\WholesaleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Wholesale\ApplyWholesaleRequest;
use App\Http\Resources\WholesaleAccountResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WholesaleController extends Controller
{
    /**
     * Dépose (ou redépose après refus) une demande de compte grossiste.
     */
    public function apply(ApplyWholesaleRequest $request): WholesaleAccountResource
    {
        $user = $request->user();

        if (in_array($user->role, [UserRole::Admin, UserRole::Manager], true)) {
            throw ValidationException::withMessages([
                'company' => ['Ce type de compte ne peut pas faire de demande grossiste.'],
            ]);
        }

        // Requête directe plutôt que la relation mise en cache sur $user :
        // on est sur le point de créer/modifier cette même relation juste
        // après, et il ne faut pas qu'un appel ultérieur dans la même
        // requête (ou le même utilisateur réutilisé en tests) lise une
        // valeur cachée périmée.
        $existing = $user->wholesaleAccount()->first();

        if ($existing?->status === WholesaleStatus::Pending) {
            throw ValidationException::withMessages([
                'company' => ['Vous avez déjà une demande en attente.'],
            ]);
        }

        if ($existing?->status === WholesaleStatus::Approved) {
            throw ValidationException::withMessages([
                'company' => ['Votre compte grossiste est déjà approuvé.'],
            ]);
        }

        $data = $request->validated();

        $account = $user->wholesaleAccount()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'status' => WholesaleStatus::Pending,
                'company' => $data['company'],
                'city' => $data['city'] ?? null,
                'item_type' => $data['item_type'],
                'volume' => $data['volume'],
                'notes' => null,
            ],
        );

        return new WholesaleAccountResource($account);
    }

    /**
     * État de la demande grossiste de l'utilisateur connecté.
     */
    public function status(Request $request): JsonResponse|WholesaleAccountResource
    {
        $account = $request->user()->wholesaleAccount()->first();

        if (! $account) {
            return response()->json(['data' => ['status' => 'none']]);
        }

        return new WholesaleAccountResource($account);
    }
}
