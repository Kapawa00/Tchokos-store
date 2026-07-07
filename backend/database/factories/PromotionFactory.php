<?php

namespace Database\Factories;

use App\Enums\PromotionType;
use App\Models\Promotion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Promotion>
 */
class PromotionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => ucfirst(fake()->words(3, true)),
            'type' => PromotionType::Percent,
            'value' => fake()->numberBetween(5, 30),
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addWeek(),
            'active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'active' => false,
            'starts_at' => now()->subMonth(),
            'ends_at' => now()->subWeeks(2),
        ]);
    }
}
