<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('last_name');
            $table->string('tax_number')->nullable()->after('country'); // BTW number
            $table->string('chamber_of_commerce')->nullable()->after('tax_number'); // KvK
            $table->string('bank_account')->nullable()->after('chamber_of_commerce'); // IBAN
            $table->string('delivery_method')->default('Email')->after('preferred_contact'); // Email, Post, Manual
            $table->string('moneybird_customer_id')->nullable()->after('moneybird_contact_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'company_name',
                'tax_number',
                'chamber_of_commerce',
                'bank_account',
                'delivery_method',
                'moneybird_customer_id',
            ]);
        });
    }
};
