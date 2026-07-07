<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bannières de la page d'accueil (carrousel/hero). Gérées depuis le
     * back-office Filament : image, accroche, lien et ordre d'affichage.
     */
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image_url');
            $table->string('link_url')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['active', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
