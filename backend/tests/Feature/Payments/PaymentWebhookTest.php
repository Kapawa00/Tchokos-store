<?php

namespace Tests\Feature\Payments;

use App\Models\Order;
use App\Models\Product;
use App\Models\Variant;
use App\Notifications\Orders\PaymentConfirmedMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    private function addToGuestCart(Variant $variant, int $quantity = 1): string
    {
        $token = $this->getJson('/api/cart')->json('data.session_token');

        $this->withHeaders(['X-Session-Token' => $token])
            ->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => $quantity])
            ->assertOk();

        return $token;
    }

    /**
     * Crée une commande invitée, démarre un paiement et renvoie
     * [Order, payment_ref].
     */
    private function createOrderWithInitiatedPayment(string $method = 'orange_money'): array
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);

        $reference = $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
            'customer_email' => 'jean@example.test',
        ])->json('data.reference');

        $order = Order::where('reference', $reference)->firstOrFail();

        $paymentRef = $this->withHeaders(['X-Session-Token' => $token])
            ->postJson("/api/payments/{$order->reference}/initiate?phone=699112233", ['method' => $method])
            ->json('payment_ref');

        return [$order, $paymentRef];
    }

    private function signedHeaders(array $payload): array
    {
        $secret = config('payments.sandbox.webhook_secret');

        return ['X-Signature' => hash_hmac('sha256', json_encode($payload), $secret)];
    }

    public function test_webhook_confirms_payment_and_marks_the_order_as_paid(): void
    {
        [$order, $paymentRef] = $this->createOrderWithInitiatedPayment('orange_money');

        $payload = ['reference' => $paymentRef, 'status' => 'SUCCESS'];

        $response = $this->postJson(
            '/api/payments/webhook/orange_money',
            $payload,
            $this->signedHeaders($payload),
        );

        $response->assertOk();
        $this->assertSame('paid', $order->refresh()->status->value);
        $this->assertDatabaseHas('transactions', [
            'reference' => $paymentRef,
            'status' => 'confirmed',
        ]);
    }

    public function test_webhook_marks_transaction_failed_on_a_failure_payload(): void
    {
        [$order, $paymentRef] = $this->createOrderWithInitiatedPayment('momo');

        $payload = ['reference' => $paymentRef, 'status' => 'FAILED'];

        $this->postJson('/api/payments/webhook/momo', $payload, $this->signedHeaders($payload))->assertOk();

        $this->assertSame('pending_payment', $order->refresh()->status->value);
        $this->assertDatabaseHas('transactions', [
            'reference' => $paymentRef,
            'status' => 'failed',
        ]);
    }

    public function test_webhook_with_an_invalid_signature_is_rejected(): void
    {
        [, $paymentRef] = $this->createOrderWithInitiatedPayment('orange_money');

        $payload = ['reference' => $paymentRef, 'status' => 'SUCCESS'];

        $response = $this->postJson('/api/payments/webhook/orange_money', $payload, ['X-Signature' => 'not-the-right-signature']);

        $response->assertStatus(401);
        $this->assertDatabaseHas('transactions', ['reference' => $paymentRef, 'status' => 'pending']);
    }

    public function test_webhook_without_a_signature_header_is_rejected(): void
    {
        [, $paymentRef] = $this->createOrderWithInitiatedPayment('orange_money');

        $payload = ['reference' => $paymentRef, 'status' => 'SUCCESS'];

        $this->postJson('/api/payments/webhook/orange_money', $payload)->assertStatus(401);
    }

    public function test_webhook_for_an_unknown_provider_returns_404(): void
    {
        $payload = ['reference' => 'SBX-DOESNOTMATTER', 'status' => 'SUCCESS'];

        $this->postJson('/api/payments/webhook/visa', $payload, $this->signedHeaders($payload))
            ->assertNotFound();
    }

    public function test_webhook_for_an_unknown_reference_returns_404(): void
    {
        $payload = ['reference' => 'SBX-DOESNOTEXIST', 'status' => 'SUCCESS'];

        $this->postJson('/api/payments/webhook/orange_money', $payload, $this->signedHeaders($payload))
            ->assertNotFound();
    }

    public function test_webhook_is_idempotent_on_retry(): void
    {
        Notification::fake();

        [$order, $paymentRef] = $this->createOrderWithInitiatedPayment('orange_money');
        $payload = ['reference' => $paymentRef, 'status' => 'SUCCESS'];
        $headers = $this->signedHeaders($payload);

        $this->postJson('/api/payments/webhook/orange_money', $payload, $headers)->assertOk();
        $second = $this->postJson('/api/payments/webhook/orange_money', $payload, $headers);

        $second->assertOk();
        $this->assertSame('Déjà traité.', $second->json('message'));

        Notification::assertSentOnDemandTimes(PaymentConfirmedMail::class, 1);
    }

    public function test_webhook_confirmation_emails_the_customer(): void
    {
        Notification::fake();

        [, $paymentRef] = $this->createOrderWithInitiatedPayment('orange_money');
        $payload = ['reference' => $paymentRef, 'status' => 'SUCCESS'];

        $this->postJson('/api/payments/webhook/orange_money', $payload, $this->signedHeaders($payload))->assertOk();

        Notification::assertSentOnDemand(
            PaymentConfirmedMail::class,
            fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'jean@example.test',
        );
    }
}
