<?php

namespace App\Http\Controllers\Payments;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\TransactionStatus;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Concerns\AuthorizesOrderAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\InitiatePaymentRequest;
use App\Http\Requests\Payment\WhatsappProofRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Order;
use App\Models\Transaction;
use App\Payments\Exceptions\InvalidPaymentPayloadException;
use App\Payments\Exceptions\InvalidWebhookSignatureException;
use App\Payments\PaymentProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class PaymentController extends Controller
{
    use AuthorizesOrderAccess;

    public function __construct(private readonly PaymentProviderManager $providers) {}

    /**
     * Démarre un paiement Orange Money / MoMo pour une commande.
     */
    public function initiate(InitiatePaymentRequest $request, string $reference): JsonResponse
    {
        $order = Order::where('reference', $reference)->firstOrFail();
        $this->authorizeOrderAccess($request, $order);

        $this->assertPendingPayment($order);

        $method = PaymentMethod::from($request->validated('method'));
        $result = $this->providers->resolve($method)->initiate($order);

        return response()->json([
            'payment_ref' => $result->paymentRef,
            'redirect_url' => $result->redirectUrl,
            'instructions' => $result->instructions,
        ]);
    }

    /**
     * Callback (webhook) signé envoyé par l'agrégateur/opérateur. Seule
     * source de vérité pour confirmer un paiement : jamais une requête
     * provenant du navigateur du client.
     */
    public function webhook(Request $request, string $provider): JsonResponse
    {
        try {
            $paymentProvider = $this->providers->resolveBySlug($provider);
        } catch (InvalidArgumentException) {
            abort(404);
        }

        if (! $paymentProvider->verifySignature($request)) {
            throw InvalidWebhookSignatureException::forProvider($provider);
        }

        try {
            $result = $paymentProvider->handleCallback($request->all());
        } catch (InvalidPaymentPayloadException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $transaction = Transaction::where('reference', $result->paymentRef)
            ->where('method', $provider)
            ->latest()
            ->first();

        if (! $transaction) {
            Log::warning("Webhook {$provider} : transaction introuvable pour la référence {$result->paymentRef}.");

            return response()->json(['message' => 'Transaction introuvable.'], 404);
        }

        // Idempotence : un webhook déjà traité (retry de l'agrégateur) ne
        // doit pas redéclencher les notifications ni re-traiter la commande.
        if ($transaction->status !== TransactionStatus::Pending) {
            return response()->json(['message' => 'Déjà traité.']);
        }

        DB::transaction(function () use ($transaction, $result) {
            $transaction->update([
                'status' => $result->status,
                'raw_payload' => $result->rawPayload,
            ]);

            $order = $transaction->order()->lockForUpdate()->first();

            if ($result->status === TransactionStatus::Confirmed && $order->status === OrderStatus::PendingPayment) {
                $previousStatus = $order->status;
                $order->update(['status' => OrderStatus::Paid]);

                try {
                    // Le paiement est déjà enregistré à ce stade : un
                    // listener de notification qui plante ne doit jamais
                    // annuler la confirmation elle-même (cf. OrderController
                    // ::store pour le même garde côté création de commande).
                    OrderStatusUpdated::dispatch($order, $previousStatus);
                } catch (\Throwable $e) {
                    Log::error("[ORDER_STATUS_EVENT_FAILED] {$e->getMessage()}", [
                        'order_reference' => $order->reference,
                        'exception' => $e::class,
                        'file' => $e->getFile().':'.$e->getLine(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }
        });

        return response()->json(['message' => 'OK']);
    }

    /**
     * Le client envoie une preuve de paiement WhatsApp (lien déjà hébergé).
     * La transaction reste "en attente de validation" jusqu'à ce qu'un
     * admin/gestionnaire la confirme manuellement (back-office).
     */
    public function whatsappProof(WhatsappProofRequest $request, string $reference): TransactionResource
    {
        $order = Order::where('reference', $reference)->firstOrFail();
        $this->authorizeOrderAccess($request, $order);

        $this->assertPendingPayment($order);

        $transaction = Transaction::updateOrCreate(
            ['order_id' => $order->id, 'method' => PaymentMethod::Whatsapp->value],
            [
                'amount' => $order->total,
                'status' => TransactionStatus::Pending->value,
                'proof_url' => $request->validated('proof_url'),
            ],
        );

        return new TransactionResource($transaction);
    }

    private function assertPendingPayment(Order $order): void
    {
        if ($order->status !== OrderStatus::PendingPayment) {
            throw ValidationException::withMessages([
                'order' => ["Cette commande n'est plus en attente de paiement."],
            ]);
        }
    }
}
