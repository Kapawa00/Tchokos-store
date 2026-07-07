<?php

namespace App\Payments\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * Levée quand des clés d'API réelles sont configurées mais que l'appel
 * réel à l'agrégateur/opérateur n'a pas encore été implémenté (en
 * l'absence de documentation au moment de l'écriture de ce provider).
 */
class PaymentProviderNotImplementedException extends RuntimeException
{
    public static function forProvider(string $provider): self
    {
        return new self(
            "Le provider « {$provider} » a des clés configurées mais l'appel API réel n'est pas ".
            'encore implémenté. Voir le TODO dans la classe correspondante.',
        );
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 503);
    }
}
