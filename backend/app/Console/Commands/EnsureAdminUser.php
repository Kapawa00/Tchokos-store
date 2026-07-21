<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class EnsureAdminUser extends Command
{
    protected $signature = 'admin:ensure';

    protected $description = "Crée ou met à jour le compte administrateur (Filament /admin) depuis ADMIN_EMAIL/ADMIN_PASSWORD. Idempotent, sans effet si ces variables sont absentes — appelé au démarrage (Procfile).";

    public function handle(): int
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! $email || ! $password) {
            $this->line('ADMIN_EMAIL / ADMIN_PASSWORD absents — compte admin inchangé.');

            return self::SUCCESS;
        }

        $user = User::firstOrNew(['email' => $email]);
        $user->name = env('ADMIN_NAME', 'Admin Tchokos');
        $user->phone = env('ADMIN_PHONE', $user->phone ?? '');
        $user->password = Hash::make($password);
        $user->role = UserRole::Admin;
        $user->email_verified_at ??= now();
        $user->save();

        $this->info($user->wasRecentlyCreated ? "Compte admin créé : {$email}" : "Compte admin mis à jour : {$email}");

        return self::SUCCESS;
    }
}
