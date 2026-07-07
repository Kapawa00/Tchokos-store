<?php

namespace Database\Factories;

use App\Enums\WholesaleStatus;
use App\Models\User;
use App\Models\WholesaleAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WholesaleAccount>
 */
class WholesaleAccountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => WholesaleStatus::Pending,
            'company' => fake()->company(),
            'city' => fake()->randomElement(['Douala', 'Yaoundé', 'Bafoussam', 'Garoua']),
            'item_type' => fake()->randomElement(['Chaussures', 'Sacs', 'Ceintures', 'Montres']),
            'volume' => fake()->randomElement(['50 pièces/mois', '100 pièces/mois', '200 pièces/mois']),
            'notes' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => WholesaleStatus::Approved,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => WholesaleStatus::Rejected,
        ]);
    }
}
