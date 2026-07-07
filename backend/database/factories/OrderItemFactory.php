<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_name' => ucfirst(fake()->words(3, true)),
            'variant_label' => fake()->optional()->randomElement(['38', '40', '42', 'Noir', 'Camel']),
            'quantity' => fake()->numberBetween(1, 3),
            'unit_price' => fake()->numberBetween(5000, 40000),
        ];
    }
}
