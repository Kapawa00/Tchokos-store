<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Les vidéos du « mur de reels » (ReelResource) ne sont plus rattachées à
     * un produit : c'est une vitrine vidéo autonome, indépendante du
     * catalogue. Les médias créés depuis la fiche produit (MediaRelationManager)
     * continuent d'avoir un product_id (renseigné implicitement par la relation).
     */
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable(false)->change();
        });
    }
};
