<?php

namespace Tests\Feature\Catalog;

use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogBrowsingTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_endpoint_returns_families_with_nested_sections(): void
    {
        $chaussures = Category::factory()->create(['name' => 'Chaussures', 'type' => 'family', 'position' => 0]);
        Category::factory()->section()->create(['name' => 'Hommes', 'parent_id' => $chaussures->id, 'position' => 0]);
        Category::factory()->create(['name' => 'Sacs', 'type' => 'family', 'position' => 1]);

        $response = $this->getJson('/api/categories');

        $response->assertOk();
        $families = collect($response->json('data'))->pluck('name');
        $this->assertSame(['Chaussures', 'Sacs'], $families->all());

        $chaussuresEntry = collect($response->json('data'))->firstWhere('slug', $chaussures->slug);
        $this->assertSame(['Hommes'], collect($chaussuresEntry['children'])->pluck('name')->all());
    }

    public function test_search_returns_matching_product_suggestions(): void
    {
        $matching = Product::factory()->create(['name' => 'Montre Homme Cuir']);
        Product::factory()->create(['name' => 'Sac à Main']);

        $response = $this->getJson('/api/search?q=Montre');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('slug');
        $this->assertTrue($names->contains($matching->slug));
        $this->assertCount(1, $response->json('data'));
    }

    public function test_search_returns_empty_for_blank_query(): void
    {
        Product::factory()->count(2)->create();

        $response = $this->getJson('/api/search?q=');

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
    }

    public function test_unknown_product_slug_returns_404(): void
    {
        $this->getJson('/api/products/does-not-exist')->assertNotFound();
    }

    public function test_product_with_only_a_video_is_visible_and_uses_its_poster(): void
    {
        $product = Product::factory()->withoutMedia()->create();
        Media::factory()->video()->for($product)->create(['poster_url' => 'produits/posters/reel.jpg']);

        $show = $this->getJson("/api/products/{$product->slug}");
        $show->assertOk();

        $listing = $this->getJson('/api/products');
        $listing->assertOk();
        $entry = collect($listing->json('data'))->firstWhere('slug', $product->slug);
        $this->assertNotNull($entry, 'Product with only a video should appear in the catalog listing.');
        $this->assertSame('produits/posters/reel.jpg', $entry['primary_image']);
    }

    public function test_product_without_any_media_returns_404(): void
    {
        $product = Product::factory()->withoutMedia()->create();

        $this->getJson("/api/products/{$product->slug}")->assertNotFound();
    }
}
