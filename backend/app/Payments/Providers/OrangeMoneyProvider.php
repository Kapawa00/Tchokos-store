<?php

namespace App\Payments\Providers;

use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Payments\DataObjects\PaymentCallbackResult;
use App\Payments\DataObjects\PaymentInitiationResult;
use App\Payments\Exceptions\PaymentProviderNotImplementedException;
use App\Payments\PaymentProvider;
use Illuminate\Http\Request;

/**
 * Orange Money Web Payment API.
 *
 * TODO une fois la documentation/les identifiants réels fournis : implémenter
 * le flux OAuth (api_username/api_password en Basic Auth → jeton d'accès),
 * puis l'appel POST de création de paiement avec le merchant_key, et adapter
 * verifySignature()/handleCallback() au format réel des webhooks Orange Money
 * (le schéma HMAC ci-dessous est un défaut interne, pas le mécanisme Orange).
 *
 * Tant que ORANGE_MONEY_MERCHANT_KEY / API_USERNAME / API_PASSWORD ne sont
 * pas renseignés, ce provider délègue à SandboxPaymentProvider pour que le
 * flux complet reste testable de bout en bout.
 */
class OrangeMoneyProvider implements PaymentProvider
{
    public function initiate(Order $order): PaymentInitiationResult
    {
        if (! $this->isConfigured()) {
            return $this->sandbox()->initiate($order);
        }

        throw PaymentProviderNotImplementedException::forProvider('orange_money');
    }

    public function verifySignature(Request $request): bool
    {
        if (! $this->isConfigured()) {
            return $this->sandbox()->verifySignature($request);
        }

        throw PaymentProviderNotImplementedException::forProvider('orange_money');
    }

    public function handleCallback(array $payload): PaymentCallbackResult
    {
        if (! $this->isConfigured()) {
            return $this->sandbox()->handleCallback($payload);
        }

        throw PaymentProviderNotImplementedException::forProvider('orange_money');
    }

    private function isConfigured(): bool
    {
        return filled(config('payments.orange_money.merchant_key'))
            && filled(config('payments.orange_money.api_username'))
            && filled(config('payments.orange_money.api_password'));
    }

    private function sandbox(): SandboxPaymentProvider
    {
        return new SandboxPaymentProvider(PaymentMethod::OrangeMoney);
    }
}
