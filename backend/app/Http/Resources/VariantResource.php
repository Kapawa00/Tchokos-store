<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Variant
 */
class VariantResource extends JsonResource
{
    /**
     * @param  \App\Models\Variant  $resource
     * @param  string|float|null  $fallbackPrice  Prix du produit parent (selon le rôle de
     *                                             l'utilisateur), utilisé si la variante n'a
     *                                             pas de price_override.
     */
    public function __construct($resource, protected string|float|null $fallbackPrice = null)
    {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'size' => $this->size,
            'color' => $this->color,
            'sku' => $this->sku,
            'stock' => $this->stock,
            'in_stock' => $this->in_stock,
            'price' => $this->price_override ?? $this->fallbackPrice,
        ];
    }
}
