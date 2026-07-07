<?php

namespace Tests\Feature\Payments;

use App\Models\Order;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WhatsappProofTest extends TestCase
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

    private function createGuestOrder(): array
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->addToGuestCart($variant, 1);

        $reference = $this->withHeaders(['X-Session-Token' => $token])->postJson('/api/orders', [
            'channel' => 'whatsapp', 'customer_name' => 'Jean Test', 'customer_phone' => '699112233',
        ])->json('data.reference');

        return [Order::where('reference', $reference)->firstOrFail(), $token];
    }

    public function test_guest_can_submit_a_whatsapp_payment_proof(): void
    {
        [$order] = $this->createGuestOrder();

        $response = $this->postJson("/api/payments/{$order->reference}/whatsapp-proof?phone=699112233", [
            'proof_url' => 'https://files.example.test/proof123.jpg',
        ]);

        $response->assertSuccessful();
        $response->assertJsonPath('data.status', 'pending');
        $response->assertJsonPath('data.method', 'whatsapp');
        $response->assertJsonPath('data.proof_url', 'https://files.example.test/proof123.jpg');

        // La commande reste en attente : seule la validation manuelle admin la fait passer à "paid".
        $this->assertSame('pending_payment', $order->refresh()->status->value);
        $this->assertDatabaseHas('transactions', [
            'order_id' => $order->id,
            'method' => 'whatsapp',
            'status' => 'pending',
        ]);
    }

    public function test_proof_url_must_be_a_valid_url(): void
    {
        [$order] = $this->createGuestOrder();

        $this->postJson("/api/payments/{$order->reference}/whatsapp-proof?phone=699112233", [
            'proof_url' => 'not-a-url',
        ])->assertStatus(422);
    }

    public function test_proof_url_is_required(): void
    {
        [$order] = $this->createGuestOrder();

        $this->postJson("/api/payments/{$order->reference}/whatsapp-proof?phone=699112233", [])
            ->assertStatus(422);
    }

    public function test_cannot_submit_proof_for_an_order_that_is_not_pending(): void
    {
        [$order] = $this->createGuestOrder();
        $order->update(['status' => 'paid']);

        $this->postJson("/api/payments/{$order->reference}/whatsapp-proof?phone=699112233", [
            'proof_url' => 'https://files.example.test/proof.jpg',
        ])->assertStatus(422);
    }

    public function test_a_stranger_cannot_submit_proof_for_someone_elses_order(): void
    {
        [$order] = $this->createGuestOrder();

        $this->postJson("/api/payments/{$order->reference}/whatsapp-proof", [
            'proof_url' => 'https://files.example.test/proof.jpg',
        ])->assertForbidden();
    }

    public function test_resubmitting_a_proof_updates_the_existing_transaction_instead_of_duplicating(): void
    {
        [$order] = $this->createGuestOrder();

        $this->postJson("/api/payments/{$order->reference}/whatsapp-proof?phone=699112233", [
            'proof_url' => 'https://files.example.test/first.jpg',
        ])->assertSuccessful();

        $this->postJson("/api/payments/{$order->reference}/whatsapp-proof?phone=699112233", [
            'proof_url' => 'https://files.example.test/second.jpg',
        ])->assertSuccessful();

        $this->assertSame(1, Transaction::where('order_id', $order->id)->count());
        $this->assertDatabaseHas('transactions', [
            'order_id' => $order->id,
            'proof_url' => 'https://files.example.test/second.jpg',
        ]);
    }

    public function test_admin_marking_order_paid_confirms_the_pending_whatsapp_transaction(): void
    {
        [$order] = $this->createGuestOrder();

        $this->postJson("/api/payments/{$order->reference}/whatsapp-proof?phone=699112233", [
            'proof_url' => 'https://files.example.test/proof.jpg',
        ])->assertSuccessful();

        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/orders/{$order->reference}/status", ['status' => 'paid'])->assertOk();

        $this->assertDatabaseHas('transactions', [
            'order_id' => $order->id,
            'method' => 'whatsapp',
            'status' => 'confirmed',
        ]);
    }
}
