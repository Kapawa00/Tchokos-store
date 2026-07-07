<?php

namespace Tests\Feature\Notifications;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use App\Notifications\Orders\OrderCreatedMail;
use App\Notifications\Orders\OrderDeliveredMail;
use App\Notifications\Orders\OrderShippedMail;
use App\Notifications\Orders\PaymentConfirmedMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderEmailNotificationTest extends TestCase
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

    public function test_creating_an_order_emails_the_customer_a_recap(): void
    {
        Notification::fake();

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);

        $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp',
            'customer_name' => 'Jean Test',
            'customer_phone' => '699112233',
            'customer_email' => 'jean@example.test',
        ])->assertCreated();

        Notification::assertSentOnDemand(
            OrderCreatedMail::class,
            fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'jean@example.test',
        );
    }

    public function test_no_email_is_sent_when_the_guest_did_not_provide_an_address(): void
    {
        Notification::fake();

        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);

        $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp',
            'customer_name' => 'Jean Test',
            'customer_phone' => '699112233',
        ])->assertCreated();

        Notification::assertNothingSent();
    }

    public function test_status_change_to_paid_sends_payment_confirmed_email(): void
    {
        $this->assertStatusChangeSendsMail('paid', PaymentConfirmedMail::class);
    }

    public function test_status_change_to_shipped_sends_shipped_email(): void
    {
        $this->assertStatusChangeSendsMail('shipped', OrderShippedMail::class);
    }

    public function test_status_change_to_delivered_sends_delivered_email(): void
    {
        $this->assertStatusChangeSendsMail('delivered', OrderDeliveredMail::class);
    }

    public function test_status_change_to_preparing_sends_no_email(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create(['status' => 'paid', 'customer_email' => 'client@example.test']);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/orders/{$order->reference}/status", ['status' => 'preparing'])->assertOk();

        Notification::assertNothingSent();
    }

    private function assertStatusChangeSendsMail(string $status, string $mailClass): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create(['status' => 'pending_payment', 'customer_email' => 'client@example.test']);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/orders/{$order->reference}/status", ['status' => $status])->assertOk();

        Notification::assertSentOnDemand(
            $mailClass,
            fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'client@example.test',
        );
    }
}
