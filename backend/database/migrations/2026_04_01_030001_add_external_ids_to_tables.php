<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('moneybird_contact_id')->nullable()->index();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('moneybird_product_id')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex(['moneybird_contact_id']);
            $table->dropColumn('moneybird_contact_id');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex(['moneybird_product_id']);
            $table->dropColumn('moneybird_product_id');
        });
    }
};
