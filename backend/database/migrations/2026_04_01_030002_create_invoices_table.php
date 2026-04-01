<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained();
            $table->foreignId('client_id')->constrained();
            $table->foreignId('appointment_id')->nullable()->constrained();
            $table->string('moneybird_invoice_id')->nullable()->index();
            $table->string('invoice_number')->nullable();
            $table->string('status')->default('draft'); // draft, open, paid, late
            $table->integer('total_cents')->default(0);
            $table->integer('tax_cents')->default(0);
            $table->string('currency', 3)->default('EUR');
            $table->string('pdf_url')->nullable();
            $table->timestamp('invoice_date')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('invoice_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained();
            $table->string('description');
            $table->integer('quantity')->default(1);
            $table->integer('price_cents');
            $table->decimal('tax_rate', 5, 2)->default(21.00);
            $table->integer('total_cents');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_lines');
        Schema::dropIfExists('invoices');
    }
};
