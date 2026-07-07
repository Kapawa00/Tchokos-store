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
 * MTN Mobile Money (Collections API).
 *
 * TODO une fois la documentation/les identifiants réels fournis : implémenter
 * le flux d'authentification (api_user/api_key en Basic Auth → jeton d'accès,
 * + en-tête Ocp-Apim-Subscription-Key avec subscription_key), puis l'appel
 * "Request to Pay", et adapter verifySignature()/handleCallback() au format
 * réel des webhooks MoMo (le schéma HMAC ci-dessous est un défaut interne,
 * pas le mécanisme MTN).
 *
 * Tant que MTN_MOMO_API_USER / API_KEY / SUBSCRIPTION_KEY ne sont pas
 * renseignés, ce provider délègue à SandboxPaymentProvider pour que le flux
 * complet reste testable de bout en bout.
 */
class MtnMomoProvider implements PaymentProvider
{
    public function initiate(Order $order): PaymentInitiationResult
    {
        if (! $this->isConfigured()) {
            return $this->sandbox()->initiate($order);
        }

        throw PaymentProviderNotImplementedException::forProvider('momo');
    }

    public function verifySignature(Request $request): bool
    {
        if (! $this->isConfigured()) {
            return $this->sandbox()->verifySignature($request);
        }

        throw PaymentProviderNotImplementedException::forProvider('momo');
    }

    public function handleCallback(array $payload): PaymentCallbackResult
    {
        if (! $this->isConfigured()) {
            return $this->sandbox()->handleCallback($payload);
        }

        throw PaymentProviderNotImplementedException::forProvider('momo');
    }

    private function isConfigured(): bool
    {
        return filled(config('payments.momo.api_user'))
            && filled(config('payments.momo.api_key'))
            && filled(config('payments.momo.subscription_key'));
    }

    private function sandbox(): SandboxPaymentProvider
    {
        return new SandboxPaymentProvider(PaymentMethod::Momo);
    }
}
