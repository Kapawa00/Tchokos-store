<?php

namespace App\Payments\Providers;

use App\Enums\PaymentMethod;
use App\Enums\TransactionStatus;
use App\Models\Order;
use App\Models\Transaction;
use App\Payments\DataObjects\PaymentCallbackResult;
use App\Payments\DataObjects\PaymentInitiationResult;
use App\Payments\Exceptions\InvalidPaymentPayloadException;
use App\Payments\PaymentProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Simule un opérateur de paiement mobile pour pouvoir tester le flux
 * complet (initiate → webhook → commande payée) sans accès réel à
 * l'API d'Orange Money / MTN MoMo. Utilisé directement, ou en repli par
 * OrangeMoneyProvider/MtnMomoProvider quand ils n'ont pas de clés réelles.
 *
 * Le « webhook » simulé attend un payload de la forme :
 * { "reference": "SBX-XXXX", "status": "SUCCESS" | "FAILED" }
 */
class SandboxPaymentProvider implements PaymentProvider
{
    public function __construct(private readonly PaymentMethod $method)
    {
    }

    public function initiate(Order $order): PaymentInitiationResult
    {
        $reference = 'SBX-'.Str::upper(Str::random(10));

        Transaction::updateOrCreate(
            ['order_id' => $order->id, 'method' => $this->method->value],
            [
                'reference' => $reference,
                'amount' => $order->total,
                'status' => TransactionStatus::Pending->value,
                'raw_payload' => ['simulated' => true, 'method' => $this->method->value],
            ],
        );

        return new PaymentInitiationResult(
            paymentRef: $reference,
            redirectUrl: null,
            instructions: "Paiement simulé (sandbox). Pour le confirmer : POST /api/payments/webhook/{$this->method->value} ".
                "avec {\"reference\":\"{$reference}\",\"status\":\"SUCCESS\"}.",
        );
    }

    public function verifySignature(Request $request): bool
    {
        $secret = config('payments.sandbox.webhook_secret');

        if (blank($secret)) {
            return false;
        }

        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        $provided = (string) $request->header('X-Signature', '');

        return $provided !== '' && hash_equals($expected, $provided);
    }

    public function handleCallback(array $payload): PaymentCallbackResult
    {
        $reference = $payload['reference'] ?? null;

        if (! is_string($reference) || $reference === '') {
            throw new InvalidPaymentPayloadException("Le champ 'reference' est obligatoire.");
        }

        $status = strtoupper((string) ($payload['status'] ?? ''));
        $confirmed = in_array($status, ['SUCCESS', 'SUCCESSFUL', 'CONFIRMED', 'PAID'], true);

        return new PaymentCallbackResult(
            paymentRef: $reference,
            status: $confirmed ? TransactionStatus::Confirmed : TransactionStatus::Failed,
            rawPayload: $payload,
        );
    }
}
