<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Variant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Variant>
 */
class VariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'size' => null,
            'color' => fake()->safeColorName(),
            'sku' => Str::upper(Str::random(10)),
            'stock' => fake()->numberBetween(0, 30),
            'price_override' => null,
        ];
    }
}
