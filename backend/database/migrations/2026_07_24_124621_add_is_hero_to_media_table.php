<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Vidéo héro de l'accueil : sélection indépendante du mur de reels
     * (is_featured_reel). Un admin choisit explicitement une seule vidéo
     * comme fond du hero, sans que ça influe sur la liste « Nos articles en
     * vidéo » et inversement.
     */
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->boolean('is_hero')->default(false)->after('is_featured_reel');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn('is_hero');
        });
    }
};
