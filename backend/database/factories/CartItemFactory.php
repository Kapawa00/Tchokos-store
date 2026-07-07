<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Variant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CartItem>
 */
class CartItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cart_id' => Cart::factory(),
            'variant_id' => Variant::factory(),
            'quantity' => fake()->numberBetween(1, 3),
            'unit_price' => fake()->numberBetween(5000, 40000),
        ];
    }
}
