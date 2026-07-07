<?php

namespace Tests\Feature\Wholesale;

use App\Models\Product;
use App\Models\User;
use App\Models\WholesaleAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WholesaleApplicationTest extends TestCase
{
    use RefreshDatabase;

    private function applicationPayload(array $overrides = []): array
    {
        return array_merge([
            'company' => 'Boutique Akwa SARL',
            'city' => 'Douala',
            'item_type' => 'Chaussures hommes',
            'volume' => '150 paires/mois',
        ], $overrides);
    }

    public function test_guest_cannot_apply(): void
    {
        $this->postJson('/api/wholesale/apply', $this->applicationPayload())->assertUnauthorized();
    }

    public function test_guest_cannot_check_status(): void
    {
        $this->getJson('/api/wholesale/status')->assertUnauthorized();
    }

    public function test_application_requires_company_item_type_and_volume(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/wholesale/apply', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['company', 'item_type', 'volume']);
    }

    public function test_customer_can_apply_and_status_becomes_pending(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/wholesale/apply', $this->applicationPayload());

        $response->assertCreated();
        $response->assertJsonPath('data.status', 'pending');
        $response->assertJsonPath('data.company', 'Boutique Akwa SARL');
        $response->assertJsonPath('data.item_type', 'Chaussures hommes');

        $this->getJson('/api/wholesale/status')->assertOk()->assertJsonPath('data.status', 'pending');
        $this->assertSame('customer', $user->refresh()->role->value);
    }

    public function test_status_is_none_without_any_application(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/wholesale/status')->assertOk()->assertJsonPath('data.status', 'none');
    }

    public function test_cannot_apply_again_while_pending(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $this->postJson('/api/wholesale/apply', $this->applicationPayload());

        $response = $this->postJson('/api/wholesale/apply', $this->applicationPayload());

        $response->assertStatus(422);
    }

    public function test_cannot_apply_once_already_approved(): void
    {
        $user = User::factory()->wholesaler()->create();
        WholesaleAccount::factory()->approved()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/wholesale/apply', $this->applicationPayload());

        $response->assertStatus(422);
    }

    public function test_can_reapply_after_rejection_which_resets_status_to_pending(): void
    {
        $user = User::factory()->create();
        WholesaleAccount::factory()->rejected()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/wholesale/apply', $this->applicationPayload(['company' => 'Nouvelle Société']));

        $response->assertOk();
        $response->assertJsonPath('data.status', 'pending');
        $response->assertJsonPath('data.company', 'Nouvelle Société');
        $this->assertSame(1, WholesaleAccount::where('user_id', $user->id)->count());
    }

    public function test_admin_cannot_apply_for_wholesale(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/wholesale/apply', $this->applicationPayload())->assertStatus(422);
    }

    public function test_approving_the_account_promotes_the_user_to_wholesaler(): void
    {
        $user = User::factory()->create();
        $account = WholesaleAccount::factory()->create(['user_id' => $user->id, 'status' => 'pending']);

        $account->update(['status' => 'approved']);

        $this->assertSame('wholesaler', $user->refresh()->role->value);
    }

    public function test_revoking_approval_demotes_the_user_back_to_customer(): void
    {
        $user = User::factory()->wholesaler()->create();
        $account = WholesaleAccount::factory()->approved()->create(['user_id' => $user->id]);

        $account->update(['status' => 'rejected']);

        $this->assertSame('customer', $user->refresh()->role->value);
    }

    public function test_wholesale_price_is_hidden_before_approval_and_visible_after(): void
    {
        $product = Product::factory()->create(['base_price' => 25000, 'wholesale_price' => 20000]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Avant la demande / pendant qu'elle est en attente : prix détail.
        $this->getJson("/api/products/{$product->slug}")->assertJsonPath('data.price', '25000.00');

        $this->postJson('/api/wholesale/apply', $this->applicationPayload())->assertCreated();
        $this->getJson("/api/products/{$product->slug}")->assertJsonPath('data.price', '25000.00');

        // Après approbation : prix de gros, partout dans l'API. On réauthentifie
        // avec une instance fraîche, comme le ferait une vraie requête HTTP
        // suivante (Sanctum::actingAs garde sinon l'objet en mémoire, avec son
        // rôle "customer" périmé, alors que l'Observer a mis à jour le rôle en
        // base via une autre instance chargée depuis la relation inverse).
        $user->wholesaleAccount->update(['status' => 'approved']);
        Sanctum::actingAs($user->fresh());

        $listResponse = $this->getJson('/api/products');
        $item = collect($listResponse->json('data'))->firstWhere('slug', $product->slug);
        $this->assertSame('20000.00', $item['price']);

        $this->getJson("/api/products/{$product->slug}")->assertJsonPath('data.price', '20000.00');
    }

    public function test_wholesale_price_disappears_again_if_approval_is_revoked(): void
    {
        $product = Product::factory()->create(['base_price' => 25000, 'wholesale_price' => 20000]);
        $user = User::factory()->wholesaler()->create();
        WholesaleAccount::factory()->approved()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->getJson("/api/products/{$product->slug}")->assertJsonPath('data.price', '20000.00');

        $user->wholesaleAccount->update(['status' => 'rejected']);
        Sanctum::actingAs($user->fresh());

        $this->getJson("/api/products/{$product->slug}")->assertJsonPath('data.price', '25000.00');
    }
}
