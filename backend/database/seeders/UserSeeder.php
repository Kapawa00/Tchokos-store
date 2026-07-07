<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\WholesaleStatus;
use App\Models\User;
use App\Models\WholesaleAccount;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Identifiants de démonstration (mot de passe "password" pour les comptes créés ici).
        // Idempotent par e-mail : si un compte existe déjà (ex. créé via /api/register),
        // on ne touche pas à son mot de passe, on s'assure seulement du bon rôle.
        $admin = $this->firstOrCreateByEmail('admin@tchokos.test', fn () => User::factory()->admin()->make([
            'name' => 'Admin Tchokos',
            'phone' => '699000001',
        ]));
        $this->ensureRole($admin, UserRole::Admin);

        $manager = $this->firstOrCreateByEmail('manager@tchokos.test', fn () => User::factory()->manager()->make([
            'name' => 'Gestionnaire Tchokos',
            'phone' => '699000004',
        ]));
        $this->ensureRole($manager, UserRole::Manager);

        $wholesaler = $this->firstOrCreateByEmail('grossiste@tchokos.test', fn () => User::factory()->wholesaler()->make([
            'name' => 'Grossiste Akwa',
            'phone' => '699000002',
        ]));
        $this->ensureRole($wholesaler, UserRole::Wholesaler);

        WholesaleAccount::firstOrCreate(
            ['user_id' => $wholesaler->id],
            [
                'status' => WholesaleStatus::Approved,
                'company' => 'Boutique Gros Akwa SARL',
                'city' => 'Douala',
            ],
        );

        $client = $this->firstOrCreateByEmail('client@tchokos.test', fn () => User::factory()->make([
            'name' => 'Client Démo',
            'phone' => '699000003',
        ]));
        $this->ensureRole($client, UserRole::Customer);

        User::factory(7)->create();
    }

    private function firstOrCreateByEmail(string $email, \Closure $makeUser): User
    {
        $existing = User::where('email', $email)->first();

        if ($existing) {
            return $existing;
        }

        $user = $makeUser();
        $user->email = $email;
        // Le personnel doit pouvoir accéder à Filament (/admin) immédiatement.
        $user->email_verified_at ??= now();
        $user->save();

        return $user;
    }

    private function ensureRole(User $user, UserRole $role): void
    {
        if ($user->role !== $role) {
            $user->update(['role' => $role]);
        }
    }
}
