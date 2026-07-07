<?php

namespace App\Payments;

use App\Enums\PaymentMethod;
use App\Payments\Providers\MtnMomoProvider;
use App\Payments\Providers\OrangeMoneyProvider;
use InvalidArgumentException;

/**
 * Résout le provider de paiement à utiliser pour un moyen de paiement donné.
 * Le canal WhatsApp n'a pas de provider (paiement assisté + preuve, validé
 * manuellement), il n'est donc pas résolu ici.
 */
class PaymentProviderManager
{
    public function resolve(PaymentMethod $method): PaymentProvider
    {
        return match ($method) {
            PaymentMethod::OrangeMoney => app(OrangeMoneyProvider::class),
            PaymentMethod::Momo => app(MtnMomoProvider::class),
            PaymentMethod::Whatsapp => throw new InvalidArgumentException(
                'Le canal WhatsApp se gère via /payments/{order}/whatsapp-proof, pas via un PaymentProvider.',
            ),
        };
    }

    public function resolveBySlug(string $slug): PaymentProvider
    {
        $method = PaymentMethod::tryFrom($slug);

        if (! $method) {
            throw new InvalidArgumentException("Fournisseur de paiement inconnu : « {$slug} ».");
        }

        return $this->resolve($method);
    }
}
