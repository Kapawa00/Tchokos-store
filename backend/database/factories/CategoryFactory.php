<?php

namespace Database\Factories;

use App\Enums\CategoryType;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => ucfirst(fake()->unique()->word()),
            'type' => CategoryType::Family,
            'parent_id' => null,
            'position' => 0,
        ];
    }

    public function section(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => CategoryType::Section,
        ]);
    }
}
