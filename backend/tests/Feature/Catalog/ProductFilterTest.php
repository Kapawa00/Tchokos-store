<?php

namespace Tests\Feature\Catalog;

use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_filter_includes_products_from_all_child_sections(): void
    {
        $chaussures = Category::factory()->create(['name' => 'Chaussures', 'type' => 'family']);
        $hommes = Category::factory()->section()->create(['name' => 'Hommes', 'parent_id' => $chaussures->id]);
        $sacs = Category::factory()->create(['name' => 'Sacs', 'type' => 'family']);

        $shoe = Product::factory()->create(['category_id' => $hommes->id]);
        $bag = Product::factory()->create(['category_id' => $sacs->id]);

        $response = $this->getJson("/api/products?category={$chaussures->slug}");

        $response->assertOk();
        $slugs = collect($response->json('data'))->pluck('slug');
        $this->assertTrue($slugs->contains($shoe->slug));
        $this->assertFalse($slugs->contains($bag->slug));
    }

    public function test_section_filter_restricts_to_a_single_section(): void
    {
        $chaussures = Category::factory()->create(['name' => 'Chaussures', 'type' => 'family']);
        $hommes = Category::factory()->section()->create(['name' => 'Hommes', 'parent_id' => $chaussures->id]);
        $femmes = Category::factory()->section()->create(['name' => 'Femmes', 'parent_id' => $chaussures->id]);

        $homme = Product::factory()->create(['category_id' => $hommes->id]);
        $femme = Product::factory()->create(['category_id' => $femmes->id]);

        $response = $this->getJson("/api/products?section={$hommes->slug}");

        $slugs = collect($response->json('data'))->pluck('slug');
        $this->assertTrue($slugs->contains($homme->slug));
        $this->assertFalse($slugs->contains($femme->slug));
    }

    public function test_size_filter_matches_products_with_a_variant_of_that_size(): void
    {
        $matching = Product::factory()->create();
        Variant::factory()->for($matching)->create(['size' => '42']);

        $other = Product::factory()->create();
        Variant::factory()->for($other)->create(['size' => '40']);

        $response = $this->getJson('/api/products?size=42');

        $slugs = collect($response->json('data'))->pluck('slug');
        $this->assertTrue($slugs->contains($matching->slug));
        $this->assertFalse($slugs->contains($other->slug));
    }

    public function test_color_filter_matches_products_with_a_variant_of_that_color(): void
    {
        $matching = Product::factory()->create();
        Variant::factory()->for($matching)->create(['color' => 'Camel']);

        $other = Product::factory()->create();
        Variant::factory()->for($other)->create(['color' => 'Noir']);

        $response = $this->getJson('/api/products?color=Camel');

        $slugs = collect($response->json('data'))->pluck('slug');
        $this->assertTrue($slugs->contains($matching->slug));
        $this->assertFalse($slugs->contains($other->slug));
    }

    public function test_price_range_filter_excludes_products_outside_the_range(): void
    {
        $cheap = Product::factory()->create(['base_price' => 5000, 'wholesale_price' => 4000]);
        $inRange = Product::factory()->create(['base_price' => 25000, 'wholesale_price' => 20000]);
        $expensive = Product::factory()->create(['base_price' => 80000, 'wholesale_price' => 60000]);

        $response = $this->getJson('/api/products?price_min=10000&price_max=40000');

        $slugs = collect($response->json('data'))->pluck('slug');
        $this->assertFalse($slugs->contains($cheap->slug));
        $this->assertTrue($slugs->contains($inRange->slug));
        $this->assertFalse($slugs->contains($expensive->slug));
    }

    public function test_in_stock_filter_excludes_products_without_available_stock(): void
    {
        $inStock = Product::factory()->create();
        Variant::factory()->for($inStock)->create(['stock' => 5]);

        $outOfStock = Product::factory()->create();
        Variant::factory()->for($outOfStock)->create(['stock' => 0]);

        $response = $this->getJson('/api/products?in_stock=1');

        $slugs = collect($response->json('data'))->pluck('slug');
        $this->assertTrue($slugs->contains($inStock->slug));
        $this->assertFalse($slugs->contains($outOfStock->slug));
    }

    public function test_is_new_filter_restricts_to_new_products(): void
    {
        $new = Product::factory()->isNew()->create();
        $old = Product::factory()->create(['is_new' => false]);

        $response = $this->getJson('/api/products?is_new=1');

        $slugs = collect($response->json('data'))->pluck('slug');
        $this->assertTrue($slugs->contains($new->slug));
        $this->assertFalse($slugs->contains($old->slug));
    }

    public function test_search_matches_name_or_description(): void
    {
        $matching = Product::factory()->create(['name' => 'Sneakers Édition Rouge']);
        $other = Product::factory()->create(['name' => 'Sac Classique Noir']);

        $response = $this->getJson('/api/products?q=Sneakers');

        $slugs = collect($response->json('data'))->pluck('slug');
        $this->assertTrue($slugs->contains($matching->slug));
        $this->assertFalse($slugs->contains($other->slug));
    }

    public function test_sort_by_price_ascending_and_descending(): void
    {
        $cheap = Product::factory()->create(['base_price' => 5000, 'wholesale_price' => 4000]);
        $mid = Product::factory()->create(['base_price' => 15000, 'wholesale_price' => 12000]);
        $expensive = Product::factory()->create(['base_price' => 30000, 'wholesale_price' => 24000]);

        $asc = $this->getJson('/api/products?sort=price_asc')->json('data');
        $this->assertSame(
            [$cheap->slug, $mid->slug, $expensive->slug],
            collect($asc)->pluck('slug')->all(),
        );

        $desc = $this->getJson('/api/products?sort=price_desc')->json('data');
        $this->assertSame(
            [$expensive->slug, $mid->slug, $cheap->slug],
            collect($desc)->pluck('slug')->all(),
        );
    }

    public function test_pagination_respects_per_page(): void
    {
        Product::factory()->count(5)->create();

        $response = $this->getJson('/api/products?per_page=2');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
        $this->assertSame(5, $response->json('meta.total'));
        $this->assertSame(3, $response->json('meta.last_page'));
    }

    public function test_promo_filter_returns_nothing_without_an_active_promotion(): void
    {
        Product::factory()->count(3)->create();

        $response = $this->getJson('/api/products?promo=1');

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
    }

    public function test_promo_filter_returns_products_with_an_active_sitewide_promotion(): void
    {
        Promotion::factory()->create([
            'active' => true,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            'type' => 'percent',
            'value' => 15,
        ]);

        // is_new explicitement à false : sinon le badge "new" (prioritaire
        // sur "discount" dans ProductResource::badge()) rendrait ce test
        // flaky, puisque la factory tire is_new aléatoirement à 20%.
        $product = Product::factory()->create(['base_price' => 20000, 'wholesale_price' => 16000, 'is_new' => false]);

        $response = $this->getJson('/api/products?promo=1');

        $response->assertOk();
        $item = collect($response->json('data'))->firstWhere('slug', $product->slug);
        $this->assertNotNull($item);
        $this->assertSame('discount', $item['badge']['type']);
        $this->assertSame('17000.00', $item['promo_price']);
    }
}
