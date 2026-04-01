<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('postal_code', 10)->nullable()->after('city');
            $table->string('country', 2)->default('NL')->after('postal_code');
            $table->string('preferred_contact')->default('email')->after('country');
            $table->string('source')->nullable()->after('preferred_contact');
            $table->text('medical_notes')->nullable()->after('notes');
            $table->string('skin_type')->nullable()->after('medical_notes');
            $table->boolean('marketing_consent')->default(false)->after('skin_type');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'city',
                'postal_code',
                'country',
                'preferred_contact',
                'source',
                'medical_notes',
                'skin_type',
                'marketing_consent',
            ]);
        });
    }
};
