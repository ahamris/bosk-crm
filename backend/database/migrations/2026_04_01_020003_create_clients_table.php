<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->text('notes')->nullable();
            $table->string('locale', 5)->default('nl');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['location_id', 'last_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
