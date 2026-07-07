<?php

namespace App\Payments\DataObjects;

use App\Enums\TransactionStatus;

/**
 * Résultat de l'interprétation d'un callback (webhook) de paiement.
 */
final class PaymentCallbackResult
{
    public function __construct(
        public readonly string $paymentRef,
        public readonly TransactionStatus $status,
        public readonly array $rawPayload = [],
    ) {
    }
}
