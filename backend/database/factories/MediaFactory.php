<?php

namespace Database\Factories;

use App\Enums\MediaType;
use App\Models\Media;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'type' => MediaType::Image,
            'url' => fake()->imageUrl(640, 800, 'fashion'),
            'poster_url' => null,
            'position' => 0,
        ];
    }

    /**
     * Vidéo (reel) factice, avec une miniature image en poster.
     */
    public function video(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => MediaType::Video,
            'url' => 'https://cdn.tchokos-demo.test/videos/'.fake()->uuid().'.mp4',
            'poster_url' => fake()->imageUrl(640, 800, 'fashion'),
        ]);
    }
}
