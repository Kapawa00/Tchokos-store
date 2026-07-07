<?php

namespace App\Payments\DataObjects;

/**
 * Résultat du démarrage d'un paiement, à renvoyer au client.
 */
final class PaymentInitiationResult
{
    public function __construct(
        public readonly string $paymentRef,
        public readonly ?string $redirectUrl = null,
        public readonly ?string $instructions = null,
    ) {
    }
}
