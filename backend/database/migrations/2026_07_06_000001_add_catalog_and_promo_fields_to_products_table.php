<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * - `show_in_catalog` : découple la visibilité boutique du statut Actif.
     *   Un produit Actif peut ainsi alimenter un reel (mur de vidéos / hero)
     *   sans apparaître comme article en vente dans la boutique.
     * - `promo_price` / `promo_wholesale_price` : prix promo par produit,
     *   distincts pour le détail et le gros — indépendants de la promotion
     *   sitewide (`promotions`).
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('show_in_catalog')->default(true)->after('status');
            $table->decimal('promo_price', 10, 2)->nullable()->after('base_price');
            $table->decimal('promo_wholesale_price', 10, 2)->nullable()->after('wholesale_price');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['show_in_catalog', 'promo_price', 'promo_wholesale_price']);
        });
    }
};
