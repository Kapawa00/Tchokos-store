<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AdminSsoTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_a_signed_admin_redirect_url_for_admin(): void
    {
        $admin = User::factory()->admin()->create(['password' => 'password']);

        $response = $this->postJson('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $response->assertOk();
        $this->assertNotNull($response->json('admin_redirect_url'));
        $this->assertStringContainsString('/admin/sso/'.$admin->id, $response->json('admin_redirect_url'));
    }

    public function test_login_does_not_return_a_redirect_url_for_a_customer(): void
    {
        $customer = User::factory()->create(['password' => 'password']);

        $response = $this->postJson('/api/login', [
            'email' => $customer->email,
            'password' => 'password',
        ]);

        $response->assertOk();
        $this->assertNull($response->json('admin_redirect_url'));
    }

    public function test_visiting_the_signed_url_logs_the_admin_into_the_web_guard_and_redirects_to_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $url = URL::temporarySignedRoute('admin.sso', now()->addSeconds(60), ['user' => $admin->id]);

        $response = $this->get($url);

        $response->assertRedirect('/admin');
        $this->assertAuthenticatedAs($admin, 'web');
    }

    public function test_the_signed_url_rejects_a_non_staff_user(): void
    {
        $customer = User::factory()->create();

        $url = URL::temporarySignedRoute('admin.sso', now()->addSeconds(60), ['user' => $customer->id]);

        $this->get($url)->assertForbidden();
    }

    public function test_an_expired_signed_url_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $url = URL::temporarySignedRoute('admin.sso', now()->subSecond(), ['user' => $admin->id]);

        $this->get($url)->assertForbidden();
    }
}
