<?php

namespace Tests\Feature\Push;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PushSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    private function payload(string $endpoint = 'https://push.example.test/abc123'): array
    {
        return [
            'endpoint' => $endpoint,
            'keys' => [
                'p256dh' => 'fake-p256dh-key',
                'auth' => 'fake-auth-key',
            ],
        ];
    }

    public function test_guest_can_subscribe(): void
    {
        $response = $this->postJson('/api/push/subscribe', $this->payload());

        $response->assertOk();
        $this->assertDatabaseHas('push_subscriptions', [
            'endpoint' => 'https://push.example.test/abc123',
            'user_id' => null,
        ]);
    }

    public function test_authenticated_user_subscription_is_linked_to_their_account(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/push/subscribe', $this->payload())->assertOk();

        $this->assertDatabaseHas('push_subscriptions', [
            'endpoint' => 'https://push.example.test/abc123',
            'user_id' => $user->id,
        ]);
    }

    public function test_subscribing_twice_with_the_same_endpoint_updates_instead_of_duplicating(): void
    {
        $this->postJson('/api/push/subscribe', $this->payload())->assertOk();
        $this->postJson('/api/push/subscribe', $this->payload())->assertOk();

        $this->assertSame(1, PushSubscription::count());
    }

    public function test_subscribe_requires_endpoint_and_keys(): void
    {
        $response = $this->postJson('/api/push/subscribe', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['endpoint', 'keys.p256dh', 'keys.auth']);
    }

    public function test_unsubscribe_removes_the_subscription(): void
    {
        PushSubscription::factory()->create(['endpoint' => 'https://push.example.test/abc123']);

        $response = $this->postJson('/api/push/unsubscribe', ['endpoint' => 'https://push.example.test/abc123']);

        $response->assertOk();
        $this->assertDatabaseMissing('push_subscriptions', ['endpoint' => 'https://push.example.test/abc123']);
    }

    public function test_unsubscribe_requires_endpoint(): void
    {
        $this->postJson('/api/push/unsubscribe', [])->assertStatus(422);
    }
}
