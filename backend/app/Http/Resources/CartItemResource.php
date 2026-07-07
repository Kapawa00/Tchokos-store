<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\CartItem
 */
class CartItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'line_total' => number_format($this->quantity * (float) $this->unit_price, 2, '.', ''),
            'variant' => [
                'id' => $this->variant->id,
                'size' => $this->variant->size,
                'color' => $this->variant->color,
                'sku' => $this->variant->sku,
                'stock' => $this->variant->stock,
                'in_stock' => $this->variant->in_stock,
            ],
            'product' => [
                'id' => $this->variant->product->id,
                'name' => $this->variant->product->name,
                'slug' => $this->variant->product->slug,
                'image' => optional($this->variant->product->primaryImage)->url,
            ],
        ];
    }
}
