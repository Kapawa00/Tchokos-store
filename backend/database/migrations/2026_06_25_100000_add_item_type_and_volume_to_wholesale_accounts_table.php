<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wholesale_accounts', function (Blueprint $table) {
            // Type d'articles visés (ex. "Chaussures hommes") et volume estimé
            // (ex. "200 paires/mois"), renseignés à la demande de compte grossiste.
            $table->string('item_type')->nullable()->after('city');
            $table->string('volume')->nullable()->after('item_type');
        });
    }

    public function down(): void
    {
        Schema::table('wholesale_accounts', function (Blueprint $table) {
            $table->dropColumn(['item_type', 'volume']);
        });
    }
};
