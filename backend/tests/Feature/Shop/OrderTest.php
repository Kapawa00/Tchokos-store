<?php

namespace Tests\Feature\Shop;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTest extends TestCase
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

    public function test_guest_can_create_an_order_from_their_cart(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create(['base_price' => 10000]))->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 2);

        $response = $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp',
            'customer_name' => 'Jean Test',
            'customer_phone' => '699112233',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.status', 'pending_payment');
        $response->assertJsonPath('data.subtotal', '20000.00');
        $response->assertJsonPath('data.shipping_fee', '1500.00');
        $response->assertJsonPath('data.total', '21500.00');
        $this->assertMatchesRegularExpression('/^TCK-\d{4}-\d{6}$/', $response->json('data.reference'));
    }

    public function test_order_reference_is_unique_and_sequential(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 10]);

        $token1 = $this->addToGuestCart($variant, 1);
        $first = $this->withHeaders(['X-Session-Token' => $token1])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'A', 'customer_phone' => '699000001',
        ])->json('data.reference');

        $token2 = $this->getJson('/api/cart')->json('data.session_token');
        $this->withHeaders(['X-Session-Token' => $token2])->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $second = $this->withHeaders(['X-Session-Token' => $token2])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'B', 'customer_phone' => '699000002',
        ])->json('data.reference');

        $this->assertNotSame($first, $second);
    }

    public function test_creating_an_order_decrements_variant_stock(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 3);

        $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ])->assertCreated();

        $this->assertSame(2, $variant->refresh()->stock);
    }

    public function test_creating_an_order_empties_the_cart(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);

        $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ])->assertCreated();

        $cart = $this->withHeaders(['X-Session-Token' => $token])->getJson('/api/cart');
        $this->assertSame([], $cart->json('data.items'));
    }

    public function test_order_cannot_be_created_with_an_empty_cart(): void
    {
        $token = $this->getJson('/api/cart')->json('data.session_token');

        $response = $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('cart');
    }

    public function test_order_creation_fails_if_stock_dropped_below_cart_quantity_in_the_meantime(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 3);

        // Une autre vente (ex. commande concurrente) réduit le stock disponible entre-temps.
        $variant->update(['stock' => 1]);

        $response = $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('cart');
        $this->assertSame(0, Order::count());
        $this->assertSame(1, $variant->refresh()->stock);
    }

    public function test_authenticated_user_order_defaults_to_their_profile_details(): void
    {
        $user = User::factory()->create(['name' => 'Client Test', 'phone' => '699998877']);
        Sanctum::actingAs($user);

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 1])->assertOk();

        $response = $this->postJson('/api/orders', ['channel' => 'site']);

        $response->assertCreated();
        $response->assertJsonPath('data.customer_name', 'Client Test');
        $response->assertJsonPath('data.customer_phone', '699998877');
    }

    public function test_guest_must_provide_name_and_phone(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);

        $response = $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', ['channel' => 'whatsapp']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_name', 'customer_phone']);
    }

    public function test_owner_can_view_their_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $reference = $this->postJson('/api/orders', ['channel' => 'site'])->json('data.reference');

        $this->getJson("/api/orders/{$reference}")->assertOk();
    }

    public function test_another_authenticated_user_cannot_view_someone_elses_order(): void
    {
        $owner = User::factory()->create();
        Sanctum::actingAs($owner);
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $reference = $this->postJson('/api/orders', ['channel' => 'site'])->json('data.reference');

        $stranger = User::factory()->create();
        Sanctum::actingAs($stranger);

        $this->getJson("/api/orders/{$reference}")->assertForbidden();
    }

    public function test_guest_can_view_their_order_by_matching_phone(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);
        $reference = $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ])->json('data.reference');

        $this->getJson("/api/orders/{$reference}?phone=699112233")->assertOk();
        $this->getJson("/api/orders/{$reference}")->assertForbidden();
        $this->getJson("/api/orders/{$reference}?phone=000000000")->assertForbidden();
    }

    public function test_admin_can_view_any_order(): void
    {
        $admin = User::factory()->admin()->create();
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);
        $reference = $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ])->json('data.reference');

        Sanctum::actingAs($admin);
        $this->getJson("/api/orders/{$reference}")->assertOk();
    }

    public function test_unknown_reference_returns_404(): void
    {
        $this->getJson('/api/orders/TCK-9999-999999')->assertNotFound();
    }

    public function test_authenticated_user_can_list_their_own_orders_only(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Order::factory()->for($user)->create();
        Order::factory()->for($user)->create();
        Order::factory()->for($other)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/orders');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_status_transition_requires_admin_or_manager_role(): void
    {
        $order = Order::factory()->create();
        $customer = User::factory()->create();
        Sanctum::actingAs($customer);

        $this->patchJson("/api/admin/orders/{$order->reference}/status", ['status' => 'paid'])
            ->assertForbidden();
    }

    public function test_status_transition_requires_authentication(): void
    {
        $order = Order::factory()->create();

        $this->patchJson("/api/admin/orders/{$order->reference}/status", ['status' => 'paid'])
            ->assertUnauthorized();
    }

    public function test_admin_can_transition_order_status(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create(['status' => 'pending_payment']);
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/orders/{$order->reference}/status", ['status' => 'paid']);

        $response->assertOk();
        $response->assertJsonPath('data.status', 'paid');
        $response->assertJsonPath('data.is_paid', true);
    }

    public function test_a_final_status_order_cannot_be_transitioned_again(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create(['status' => 'delivered']);
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/orders/{$order->reference}/status", ['status' => 'cancelled']);

        $response->assertStatus(422);
    }
}
