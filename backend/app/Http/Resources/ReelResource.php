<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Reel (média vidéo) du « mur de reels » de l'accueil, avec le produit associé.
 *
 * @mixin \App\Models\Media
 */
class ReelResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'poster_url' => $this->poster_url,
            // Vitrine autonome : une vidéo peut ne pas être rattachée à un produit.
            'product' => $this->whenLoaded('product', fn () => $this->product ? [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
            ] : null),
        ];
    }
}
