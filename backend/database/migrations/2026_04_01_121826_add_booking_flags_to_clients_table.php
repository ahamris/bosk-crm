<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->integer('no_show_count')->default(0)->after('marketing_consent');
            $table->integer('late_cancel_count')->default(0)->after('no_show_count');
            $table->boolean('requires_deposit')->default(false)->after('late_cancel_count');
            $table->boolean('requires_prepayment')->default(false)->after('requires_deposit');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['no_show_count', 'late_cancel_count', 'requires_deposit', 'requires_prepayment']);
        });
    }
};
