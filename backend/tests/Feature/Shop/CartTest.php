<?php

namespace Tests\Feature\Shop;

use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cart_is_created_with_a_session_token(): void
    {
        $response = $this->getJson('/api/cart');

        $response->assertOk();
        $this->assertNotNull($response->json('data.session_token'));
        $this->assertSame([], $response->json('data.items'));
    }

    public function test_guest_can_add_an_item_using_the_session_token_header(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create(['base_price' => 10000]))->create(['stock' => 5]);

        $token = $this->getJson('/api/cart')->json('data.session_token');

        $response = $this->withHeaders(['X-Session-Token' => $token])
            ->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);

        $response->assertOk();
        $this->assertSame(2, $response->json('data.items_count'));
        $this->assertSame('20000.00', $response->json('data.subtotal'));

        // La même session retrouve son panier (et non un nouveau panier vide).
        $reload = $this->withHeaders(['X-Session-Token' => $token])->getJson('/api/cart');
        $this->assertSame(2, $reload->json('data.items_count'));
    }

    public function test_adding_an_item_twice_increments_the_existing_line_instead_of_duplicating(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 10]);
        $token = $this->getJson('/api/cart')->json('data.session_token');
        $headers = ['X-Session-Token' => $token];

        $this->withHeaders($headers)->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);
        $response = $this->withHeaders($headers)->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 3]);

        $response->assertOk();
        $this->assertCount(1, $response->json('data.items'));
        $this->assertSame(5, $response->json('data.items_count'));
    }

    public function test_adding_more_than_available_stock_is_rejected(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 3]);
        $token = $this->getJson('/api/cart')->json('data.session_token');

        $response = $this->withHeaders(['X-Session-Token' => $token])
            ->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 4]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('quantity');
    }

    public function test_updating_an_item_beyond_stock_is_rejected(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->getJson('/api/cart')->json('data.session_token');
        $headers = ['X-Session-Token' => $token];

        $this->withHeaders($headers)->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);
        $itemId = $this->withHeaders($headers)->getJson('/api/cart')->json('data.items.0.id');

        $response = $this->withHeaders($headers)->patchJson("/api/cart/items/{$itemId}", ['quantity' => 50]);

        $response->assertStatus(422);
    }

    public function test_an_item_can_be_removed_from_the_cart(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->getJson('/api/cart')->json('data.session_token');
        $headers = ['X-Session-Token' => $token];

        $this->withHeaders($headers)->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $itemId = $this->withHeaders($headers)->getJson('/api/cart')->json('data.items.0.id');

        $response = $this->withHeaders($headers)->deleteJson("/api/cart/items/{$itemId}");

        $response->assertOk();
        $this->assertSame([], $response->json('data.items'));
    }

    public function test_clearing_the_cart_removes_all_items(): void
    {
        $variantA = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $variantB = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->getJson('/api/cart')->json('data.session_token');
        $headers = ['X-Session-Token' => $token];

        $this->withHeaders($headers)->postJson('/api/cart/items', ['variant_id' => $variantA->id, 'quantity' => 1]);
        $this->withHeaders($headers)->postJson('/api/cart/items', ['variant_id' => $variantB->id, 'quantity' => 1]);

        $response = $this->withHeaders($headers)->deleteJson('/api/cart');

        $response->assertOk();
        $this->assertSame([], $response->json('data.items'));
    }

    public function test_authenticated_user_cart_is_tied_to_their_account_without_a_session_token(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/cart');

        $response->assertOk();
        $this->assertNull($response->json('data.session_token'));
    }

    public function test_guest_cart_merges_into_user_cart_on_first_authenticated_request(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 5]);
        $token = $this->getJson('/api/cart')->json('data.session_token');
        $this->withHeaders(['X-Session-Token' => $token])
            ->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Le frontend continue d'envoyer l'ancien X-Session-Token après
        // connexion : le panier invité doit être récupéré, pas ignoré.
        $response = $this->withHeaders(['X-Session-Token' => $token])->getJson('/api/cart');

        $response->assertOk();
        $this->assertSame(2, $response->json('data.items_count'));
    }

    public function test_merge_combines_quantities_for_a_variant_already_in_the_user_cart(): void
    {
        $variant = Variant::factory()->for(Product::factory()->create())->create(['stock' => 10]);
        $token = $this->getJson('/api/cart')->json('data.session_token');
        $this->withHeaders(['X-Session-Token' => $token])
            ->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 3]);

        $response = $this->withHeaders(['X-Session-Token' => $token])->getJson('/api/cart');

        $response->assertOk();
        $this->assertCount(1, $response->json('data.items'));
        $this->assertSame(5, $response->json('data.items_count'));
    }

    public function test_unknown_cart_item_returns_404(): void
    {
        $response = $this->getJson('/api/cart');
        $token = $response->json('data.session_token');

        $this->withHeaders(['X-Session-Token' => $token])
            ->deleteJson('/api/cart/items/999999')
            ->assertNotFound();
    }
}
