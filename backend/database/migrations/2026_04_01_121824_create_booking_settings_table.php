<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->integer('cancellation_window_hours')->default(24);
            $table->integer('late_cancel_charge_percent')->default(100);
            $table->integer('no_show_charge_percent')->default(100);
            $table->integer('max_pay_at_venue_bookings')->default(3);
            $table->boolean('require_deposit')->default(false);
            $table->integer('deposit_percent')->default(50);
            $table->integer('min_booking_notice_hours')->default(1);
            $table->integer('max_booking_advance_days')->default(90);
            $table->boolean('auto_confirm')->default(true);
            $table->text('cancellation_policy_nl')->nullable();
            $table->text('cancellation_policy_en')->nullable();
            $table->text('cancellation_policy_ru')->nullable();
            $table->json('amenities')->nullable();
            $table->json('social_links')->nullable();
            $table->text('about_nl')->nullable();
            $table->text('about_en')->nullable();
            $table->text('about_ru')->nullable();
            $table->timestamps();
            $table->unique('location_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_settings');
    }
};
