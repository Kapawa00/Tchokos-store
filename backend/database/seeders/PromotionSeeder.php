<?php

namespace Database\Seeders;

use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        Promotion::factory()->create([
            'title' => 'Promo de lancement -15%',
            'type' => 'percent',
            'value' => 15,
            'starts_at' => now()->subDays(2),
            'ends_at' => now()->addDays(12),
            'active' => true,
        ]);
    }
}
