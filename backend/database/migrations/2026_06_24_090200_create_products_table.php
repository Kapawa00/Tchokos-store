<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->decimal('base_price', 10, 2);
            $table->decimal('wholesale_price', 10, 2)->nullable();
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->boolean('is_new')->default(false);
            $table->timestamps();

            $table->index(['status', 'is_new']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
