<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Un produit sans aucun média (photo ou vidéo) n'est jamais affiché
     * publiquement (cf. ProductController) : on attache donc une image par
     * défaut, comme le ferait un upload admin. Utiliser `withoutMedia()`
     * pour tester explicitement le cas d'un produit incomplet.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Product $product) {
            if (! $product->relationLoaded('media') && $product->media()->count() === 0) {
                Media::factory()->for($product)->create();
            }
        });
    }

    /** Produit sans média — pour tester l'exclusion des fiches incomplètes. */
    public function withoutMedia(): static
    {
        return $this->afterCreating(function (Product $product) {
            $product->media()->delete();
        });
    }

    public function definition(): array
    {
        $basePrice = fake()->numberBetween(5000, 60000);

        return [
            'name' => ucfirst(fake()->unique()->words(3, true)),
            'description' => fake()->sentence(12),
            'category_id' => Category::factory(),
            'base_price' => $basePrice,
            'wholesale_price' => (int) round($basePrice * 0.8),
            'status' => ProductStatus::Active,
            'is_new' => fake()->boolean(20),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProductStatus::Draft,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProductStatus::Archived,
        ]);
    }

    public function isNew(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_new' => true,
        ]);
    }
}
