<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('method', ['orange_money', 'momo', 'whatsapp']);
            $table->string('reference')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'failed'])->default('pending');
            $table->string('proof_url')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
