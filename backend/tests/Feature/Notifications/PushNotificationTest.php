<?php

namespace Tests\Feature\Notifications;

use App\Models\Order;
use App\Models\Product;
use App\Models\PushSubscription;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery\MockInterface;
use Minishlink\WebPush\WebPush;
use Tests\TestCase;

class PushNotificationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Remplace le client WebPush réel par un mock qui n'effectue aucun appel
     * réseau, et retourne le nombre de notifications mises en file (donc
     * effectivement envoyées via flush()).
     */
    private function mockWebPush(int $expectedQueued): void
    {
        $this->mock(WebPush::class, function (MockInterface $mock) use ($expectedQueued) {
            $mock->shouldReceive('queueNotification')->times($expectedQueued);
            // andReturnUsing (pas andReturn) : un Generator ne se parcourt
            // qu'une fois, il faut donc en produire un nouveau à chaque appel
            // plutôt que de réutiliser la même instance déjà épuisée.
            $mock->shouldReceive('flush')->andReturnUsing(fn () => (function () {
                return;
                yield;
            })());
        });
    }

    private function addToGuestCart(Variant $variant, int $quantity = 1): string
    {
        $token = $this->getJson('/api/cart')->json('data.session_token');

        $this->withHeaders(['X-Session-Token' => $token])
            ->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => $quantity])
            ->assertOk();

        return $token;
    }

    public function test_new_order_pushes_a_notification_to_admins_with_a_subscription(): void
    {
        $admin = User::factory()->admin()->create();
        PushSubscription::factory()->create(['user_id' => $admin->id]);
        // Un gestionnaire sans abonnement ne doit pas compter dans le total attendu.
        User::factory()->manager()->create();

        $this->mockWebPush(expectedQueued: 1);

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);

        $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ])->assertCreated();
    }

    public function test_new_order_does_not_touch_webpush_when_no_admin_is_subscribed(): void
    {
        User::factory()->admin()->create();

        $this->mockWebPush(expectedQueued: 0);

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);

        $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ])->assertCreated();
    }

    public function test_status_change_pushes_a_notification_to_the_orders_user(): void
    {
        $customer = User::factory()->create();
        PushSubscription::factory()->create(['user_id' => $customer->id]);
        $order = Order::factory()->for($customer)->create(['status' => 'pending_payment']);

        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->mockWebPush(expectedQueued: 1);

        $this->patchJson("/api/admin/orders/{$order->reference}/status", ['status' => 'paid'])->assertOk();
    }

    public function test_status_change_does_not_push_for_a_guest_order(): void
    {
        $order = Order::factory()->create(['status' => 'pending_payment', 'user_id' => null]);

        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->mockWebPush(expectedQueued: 0);

        $this->patchJson("/api/admin/orders/{$order->reference}/status", ['status' => 'paid'])->assertOk();
    }

    public function test_variant_back_in_stock_pushes_to_all_subscribers(): void
    {
        PushSubscription::factory()->count(3)->create();

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 0]);

        $this->mockWebPush(expectedQueued: 3);

        $variant->update(['stock' => 5]);
    }

    public function test_restocking_an_already_in_stock_variant_does_not_push(): void
    {
        PushSubscription::factory()->create();

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);

        $this->mockWebPush(expectedQueued: 0);

        $variant->update(['stock' => 10]);
    }

    public function test_setting_stock_to_zero_does_not_trigger_a_back_in_stock_push(): void
    {
        PushSubscription::factory()->create();

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);

        $this->mockWebPush(expectedQueued: 0);

        $variant->update(['stock' => 0]);
    }
}
