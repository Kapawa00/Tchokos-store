<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed de base : uniquement la taxonomie réelle du catalogue (familles et
     * rayons). Aucune donnée de démonstration (produits, utilisateurs,
     * commandes, promotions) n'est injectée : le contenu réel s'ajoute via le
     * back-office Filament, et le compte admin via `create-superuser.cjs`.
     *
     * Les seeders de démo (UserSeeder, ProductSeeder, PromotionSeeder,
     * OrderSeeder) restent disponibles pour un environnement de test/démo
     * ponctuel : `php artisan db:seed --class=ProductSeeder`.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
        ]);
    }
}
