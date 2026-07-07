<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Cart
 */
class CartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->items;

        return [
            'id' => $this->id,
            // Le jeton invité n'a pas de sens (ni d'utilité côté client) une
            // fois le panier rattaché à un compte utilisateur.
            'session_token' => $this->user_id ? null : $this->session_token,
            'items' => CartItemResource::collection($items),
            'items_count' => $items->sum('quantity'),
            'subtotal' => number_format(
                $items->sum(fn ($item) => $item->quantity * (float) $item->unit_price),
                2,
                '.',
                '',
            ),
        ];
    }
}
