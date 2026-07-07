<?php

namespace Tests\Feature\Catalog;

use App\Models\Product;
use App\Models\User;
use App\Models\WholesaleAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductPriceByRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_sees_retail_price_in_list_and_detail(): void
    {
        $product = Product::factory()->create(['base_price' => 25000, 'wholesale_price' => 20000]);

        $list = $this->getJson('/api/products');
        $item = collect($list->json('data'))->firstWhere('slug', $product->slug);
        $this->assertSame('25000.00', $item['price']);

        $detail = $this->getJson("/api/products/{$product->slug}");
        $detail->assertOk()->assertJsonPath('data.price', '25000.00');
    }

    public function test_customer_sees_retail_price(): void
    {
        $customer = User::factory()->create();
        Sanctum::actingAs($customer);

        $product = Product::factory()->create(['base_price' => 25000, 'wholesale_price' => 20000]);

        $this->getJson("/api/products/{$product->slug}")
            ->assertOk()
            ->assertJsonPath('data.price', '25000.00');
    }

    public function test_pending_wholesaler_sees_retail_price(): void
    {
        $wholesaler = User::factory()->wholesaler()->create();
        WholesaleAccount::factory()->create(['user_id' => $wholesaler->id, 'status' => 'pending']);
        Sanctum::actingAs($wholesaler);

        $product = Product::factory()->create(['base_price' => 25000, 'wholesale_price' => 20000]);

        $this->getJson("/api/products/{$product->slug}")
            ->assertOk()
            ->assertJsonPath('data.price', '25000.00');
    }

    public function test_approved_wholesaler_sees_wholesale_price_in_list_and_detail(): void
    {
        $wholesaler = User::factory()->wholesaler()->create();
        WholesaleAccount::factory()->approved()->create(['user_id' => $wholesaler->id]);
        Sanctum::actingAs($wholesaler);

        $product = Product::factory()->create(['base_price' => 25000, 'wholesale_price' => 20000]);

        $list = $this->getJson('/api/products');
        $item = collect($list->json('data'))->firstWhere('slug', $product->slug);
        $this->assertSame('20000.00', $item['price']);

        $this->getJson("/api/products/{$product->slug}")
            ->assertOk()
            ->assertJsonPath('data.price', '20000.00');
    }

    public function test_approved_wholesaler_without_a_wholesale_price_falls_back_to_retail(): void
    {
        $wholesaler = User::factory()->wholesaler()->create();
        WholesaleAccount::factory()->approved()->create(['user_id' => $wholesaler->id]);
        Sanctum::actingAs($wholesaler);

        $product = Product::factory()->create(['base_price' => 25000, 'wholesale_price' => null]);

        $this->getJson("/api/products/{$product->slug}")
            ->assertOk()
            ->assertJsonPath('data.price', '25000.00');
    }

    public function test_price_range_filter_uses_wholesale_price_for_an_approved_wholesaler(): void
    {
        $product = Product::factory()->create(['base_price' => 25000, 'wholesale_price' => 20000]);

        // En invité : le filtre se base sur le prix détail (25000), donc exclu par un plafond à 22000.
        $guestResponse = $this->getJson('/api/products?price_max=22000');
        $this->assertFalse(collect($guestResponse->json('data'))->pluck('slug')->contains($product->slug));

        // En grossiste approuvé : le filtre se base sur le prix de gros (20000), donc inclus.
        $wholesaler = User::factory()->wholesaler()->create();
        WholesaleAccount::factory()->approved()->create(['user_id' => $wholesaler->id]);
        Sanctum::actingAs($wholesaler);

        $wholesalerResponse = $this->getJson('/api/products?price_max=22000');
        $this->assertTrue(collect($wholesalerResponse->json('data'))->pluck('slug')->contains($product->slug));
    }
}
