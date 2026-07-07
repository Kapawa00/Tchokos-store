<?php

namespace Database\Factories;

use App\Enums\OrderChannel;
use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'customer_name' => fake()->name(),
            'customer_phone' => fake()->numerify('6########'),
            'customer_email' => fake()->optional()->safeEmail(),
            'channel' => fake()->randomElement(OrderChannel::cases()),
            'status' => OrderStatus::PendingPayment,
            'subtotal' => 0,
            'shipping_fee' => 1500,
            'total' => 0,
            'notes' => null,
        ];
    }

    public function status(OrderStatus $status): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $status,
        ]);
    }
}
