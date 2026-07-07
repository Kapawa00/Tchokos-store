<?php

namespace Tests\Feature\Payments;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentInitiateTest extends TestCase
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

    private function createGuestOrder(): Order
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);

        $reference = $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ])->json('data.reference');

        return Order::where('reference', $reference)->firstOrFail();
    }

    public function test_guest_can_initiate_an_orange_money_payment_in_sandbox_mode(): void
    {
        $order = $this->createGuestOrder();

        $response = $this->postJson("/api/payments/{$order->reference}/initiate?phone=699112233", [
            'method' => 'orange_money',
        ]);

        $response->assertOk();
        $this->assertStringStartsWith('SBX-', $response->json('payment_ref'));
        $this->assertNull($response->json('redirect_url'));
        $this->assertNotNull($response->json('instructions'));

        $this->assertDatabaseHas('transactions', [
            'order_id' => $order->id,
            'method' => 'orange_money',
            'status' => 'pending',
            'reference' => $response->json('payment_ref'),
        ]);
    }

    public function test_guest_can_initiate_a_momo_payment_in_sandbox_mode(): void
    {
        $order = $this->createGuestOrder();

        $response = $this->postJson("/api/payments/{$order->reference}/initiate?phone=699112233", [
            'method' => 'momo',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('transactions', [
            'order_id' => $order->id,
            'method' => 'momo',
            'status' => 'pending',
        ]);
    }

    public function test_initiate_rejects_an_invalid_method(): void
    {
        $order = $this->createGuestOrder();

        $this->postJson("/api/payments/{$order->reference}/initiate?phone=699112233", ['method' => 'visa'])
            ->assertStatus(422);
    }

    public function test_initiate_rejects_whatsapp_as_a_method(): void
    {
        $order = $this->createGuestOrder();

        $this->postJson("/api/payments/{$order->reference}/initiate?phone=699112233", ['method' => 'whatsapp'])
            ->assertStatus(422);
    }

    public function test_cannot_initiate_payment_for_an_order_that_is_not_pending(): void
    {
        $order = $this->createGuestOrder();
        $order->update(['status' => 'cancelled']);

        $this->postJson("/api/payments/{$order->reference}/initiate?phone=699112233", ['method' => 'orange_money'])
            ->assertStatus(422);
    }

    public function test_a_stranger_cannot_initiate_payment_without_matching_identity(): void
    {
        $order = $this->createGuestOrder();

        $this->postJson("/api/payments/{$order->reference}/initiate", ['method' => 'orange_money'])
            ->assertForbidden();

        $this->postJson("/api/payments/{$order->reference}/initiate?phone=000000000", ['method' => 'orange_money'])
            ->assertForbidden();
    }

    public function test_authenticated_owner_can_initiate_payment(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $reference = $this->postJson('/api/orders', ['channel' => 'site'])->json('data.reference');

        $this->postJson("/api/payments/{$reference}/initiate", ['method' => 'momo'])->assertOk();
    }

    public function test_another_authenticated_user_cannot_initiate_payment_for_someone_elses_order(): void
    {
        $owner = User::factory()->create();
        Sanctum::actingAs($owner);
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $reference = $this->postJson('/api/orders', ['channel' => 'site'])->json('data.reference');

        $stranger = User::factory()->create();
        Sanctum::actingAs($stranger);

        $this->postJson("/api/payments/{$reference}/initiate", ['method' => 'momo'])->assertForbidden();
    }
}
