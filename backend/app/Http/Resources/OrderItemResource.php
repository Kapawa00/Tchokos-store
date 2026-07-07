<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\OrderItem
 */
class OrderItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_name' => $this->product_name,
            'variant_label' => $this->variant_label,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'line_total' => number_format($this->quantity * (float) $this->unit_price, 2, '.', ''),
        ];
    }
}
