<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integrations', function (Blueprint $table) {
            $table->id();
            $table->string('provider');  // 'moneybird', 'mollie', 'google_calendar', etc.
            $table->string('name');
            $table->boolean('is_active')->default(false);
            $table->json('settings')->nullable();  // API keys, tokens, config
            $table->json('metadata')->nullable();  // last sync timestamps, etc.
            $table->timestamps();
            $table->unique('provider');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integrations');
    }
};
