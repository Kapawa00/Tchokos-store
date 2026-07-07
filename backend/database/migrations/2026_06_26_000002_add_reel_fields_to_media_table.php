<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * « Mur de reels » de l'accueil : un média vidéo peut être mis en avant
     * (is_featured_reel) et ordonné indépendamment de sa position au sein du
     * produit (reel_position).
     */
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->boolean('is_featured_reel')->default(false)->after('position');
            $table->unsignedInteger('reel_position')->nullable()->after('is_featured_reel');

            $table->index(['is_featured_reel', 'reel_position']);
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex(['is_featured_reel', 'reel_position']);
            $table->dropColumn(['is_featured_reel', 'reel_position']);
        });
    }
};
