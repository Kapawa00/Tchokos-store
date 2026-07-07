<?php

namespace App\Payments\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class InvalidWebhookSignatureException extends RuntimeException
{
    public static function forProvider(string $provider): self
    {
        return new self("Signature de webhook invalide pour le fournisseur « {$provider} ».");
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 401);
    }
}
