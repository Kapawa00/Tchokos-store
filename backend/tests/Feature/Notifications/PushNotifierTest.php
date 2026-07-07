<?php

namespace Tests\Feature\Notifications;

use App\Models\PushSubscription;
use App\Models\User;
use App\Services\PushNotifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Minishlink\WebPush\MessageSentReport;
use Minishlink\WebPush\WebPush;
use Tests\TestCase;

class PushNotifierTest extends TestCase
{
    use RefreshDatabase;

    public function test_notify_user_only_targets_that_users_subscriptions(): void
    {
        $user = User::factory()->create();
        PushSubscription::factory()->create(['user_id' => $user->id]);
        PushSubscription::factory()->create(['user_id' => null]);
        PushSubscription::factory()->create(['user_id' => User::factory()->create()->id]);

        $this->mock(WebPush::class, function ($mock) {
            $mock->shouldReceive('queueNotification')->once();
            $mock->shouldReceive('flush')->andReturnUsing(fn () => $this->emptyGenerator());
        });

        app(PushNotifier::class)->notifyUser($user, 'Titre', 'Corps');
    }

    public function test_notify_admins_only_targets_admin_and_manager_subscriptions(): void
    {
        $admin = User::factory()->admin()->create();
        $manager = User::factory()->manager()->create();
        $customer = User::factory()->create();

        PushSubscription::factory()->create(['user_id' => $admin->id]);
        PushSubscription::factory()->create(['user_id' => $manager->id]);
        PushSubscription::factory()->create(['user_id' => $customer->id]);

        $this->mock(WebPush::class, function ($mock) {
            $mock->shouldReceive('queueNotification')->twice();
            $mock->shouldReceive('flush')->andReturnUsing(fn () => $this->emptyGenerator());
        });

        app(PushNotifier::class)->notifyAdmins('Titre', 'Corps');
    }

    public function test_notify_subscribers_targets_every_subscription(): void
    {
        PushSubscription::factory()->count(4)->create();

        $this->mock(WebPush::class, function ($mock) {
            $mock->shouldReceive('queueNotification')->times(4);
            $mock->shouldReceive('flush')->andReturnUsing(fn () => $this->emptyGenerator());
        });

        app(PushNotifier::class)->notifySubscribers('Titre', 'Corps');
    }

    public function test_expired_subscription_is_deleted_after_a_failed_send(): void
    {
        $subscription = PushSubscription::factory()->create();

        $report = $this->mock(MessageSentReport::class, function ($mock) use ($subscription) {
            $mock->shouldReceive('isSuccess')->andReturn(false);
            $mock->shouldReceive('isSubscriptionExpired')->andReturn(true);
            $mock->shouldReceive('getEndpoint')->andReturn($subscription->endpoint);
        });

        $this->mock(WebPush::class, function ($mock) use ($report) {
            $mock->shouldReceive('queueNotification')->once();
            $mock->shouldReceive('flush')->andReturnUsing(fn () => (function () use ($report) {
                yield $report;
            })());
        });

        app(PushNotifier::class)->notifySubscribers('Titre', 'Corps');

        $this->assertDatabaseMissing('push_subscriptions', ['id' => $subscription->id]);
    }

    public function test_a_failed_but_not_expired_subscription_is_kept(): void
    {
        $subscription = PushSubscription::factory()->create();

        $report = $this->mock(MessageSentReport::class, function ($mock) use ($subscription) {
            $mock->shouldReceive('isSuccess')->andReturn(false);
            $mock->shouldReceive('isSubscriptionExpired')->andReturn(false);
            $mock->shouldReceive('getEndpoint')->andReturn($subscription->endpoint);
        });

        $this->mock(WebPush::class, function ($mock) use ($report) {
            $mock->shouldReceive('queueNotification')->once();
            $mock->shouldReceive('flush')->andReturnUsing(fn () => (function () use ($report) {
                yield $report;
            })());
        });

        app(PushNotifier::class)->notifySubscribers('Titre', 'Corps');

        $this->assertDatabaseHas('push_subscriptions', ['id' => $subscription->id]);
    }

    public function test_nothing_is_sent_when_there_are_no_subscriptions(): void
    {
        $this->mock(WebPush::class, function ($mock) {
            $mock->shouldNotReceive('queueNotification');
            $mock->shouldNotReceive('flush');
        });

        app(PushNotifier::class)->notifySubscribers('Titre', 'Corps');
    }

    private function emptyGenerator(): \Generator
    {
        return (function () {
            return;
            yield;
        })();
    }
}
