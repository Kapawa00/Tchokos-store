<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\TransactionStatus;
use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'method' => fake()->randomElement(PaymentMethod::cases()),
            'reference' => Str::upper(Str::random(12)),
            'amount' => fake()->numberBetween(5000, 60000),
            'status' => TransactionStatus::Confirmed,
            'proof_url' => null,
            'raw_payload' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TransactionStatus::Pending,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TransactionStatus::Failed,
        ]);
    }
}
