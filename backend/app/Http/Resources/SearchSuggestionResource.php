<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Suggestion légère pour la recherche rapide (autocomplete).
 *
 * @mixin \App\Models\Product
 */
class SearchSuggestionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'price' => $this->display_price,
            'image' => $this->whenLoaded('primaryImage', fn () => optional($this->primaryImage)->url),
        ];
    }
}
