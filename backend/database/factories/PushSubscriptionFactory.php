<?php

namespace Database\Factories;

use App\Models\PushSubscription;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PushSubscription>
 */
class PushSubscriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'endpoint' => 'https://fcm.example.test/'.Str::random(32),
            'p256dh' => Str::random(87),
            'auth' => Str::random(22),
        ];
    }
}
