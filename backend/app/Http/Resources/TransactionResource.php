<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Transaction
 */
class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'method' => $this->method->value,
            'reference' => $this->reference,
            'amount' => $this->amount,
            'status' => $this->status->value,
            'proof_url' => $this->proof_url,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
