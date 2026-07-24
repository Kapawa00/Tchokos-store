<?php

namespace Tests\Feature\Catalog;

use App\Models\Media;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReelWallTest extends TestCase
{
    use RefreshDatabase;

    public function test_reel_wall_only_returns_videos_explicitly_marked_featured(): void
    {
        Media::factory()->video()->create(['product_id' => null, 'is_featured_reel' => true]);
        Media::factory()->video()->create(['product_id' => null, 'is_featured_reel' => false]);

        $response = $this->getJson('/api/reels');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_reel_wall_is_empty_when_nothing_is_marked_featured(): void
    {
        Media::factory()->video()->create(['product_id' => null, 'is_featured_reel' => false]);

        $response = $this->getJson('/api/reels');

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
    }

    public function test_hero_video_does_not_need_to_be_in_the_reel_wall(): void
    {
        Media::factory()->video()->create([
            'product_id' => null,
            'is_featured_reel' => false,
            'is_hero' => true,
        ]);

        $hero = $this->getJson('/api/reels/hero');
        $hero->assertOk();
        $this->assertNotNull($hero->json('data'));

        $wall = $this->getJson('/api/reels');
        $wall->assertOk();
        $this->assertCount(0, $wall->json('data'));
    }
}
