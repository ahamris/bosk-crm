<?php

namespace App\Observers;

use App\Models\Appointment;
use App\Models\Integration;
use App\Models\Invoice;
use App\Services\Moneybird\MoneybirdClient;
use App\Services\Moneybird\MoneybirdSync;

class AppointmentObserver
{
    public function updated(Appointment $appointment): void
    {
        // Auto-create invoice when appointment is completed
        if ($appointment->isDirty('status') && $appointment->status === 'completed') {
            $this->createAndSyncInvoice($appointment);
        }
    }

    private function createAndSyncInvoice(Appointment $appointment): void
    {
        // Check if invoice already exists
        if (Invoice::where('appointment_id', $appointment->id)->exists()) return;

        $service = $appointment->service;
        if (!$service) return;

        $invoice = $appointment->location->invoices()->create([
            'client_id' => $appointment->client_id,
            'appointment_id' => $appointment->id,
            'status' => 'draft',
            'invoice_date' => now(),
            'due_date' => now()->addDays(14),
        ]);

        $lineTotalCents = $service->price_cents;
        $taxCents = (int) round($lineTotalCents * 0.21);

        $invoice->lines()->create([
            'service_id' => $service->id,
            'description' => $service->name_nl,
            'quantity' => 1,
            'price_cents' => $service->price_cents,
            'tax_rate' => 21.00,
            'total_cents' => $lineTotalCents,
        ]);

        $invoice->update([
            'total_cents' => $lineTotalCents + $taxCents,
            'tax_cents' => $taxCents,
        ]);

        // If Moneybird is active, send invoice
        $integration = Integration::forProvider('moneybird');
        if ($integration?->is_active) {
            try {
                $sync = app(MoneybirdSync::class);
                $sync->createInvoice($invoice);

                // Send the invoice via Moneybird (emails to client)
                $client = app(MoneybirdClient::class);
                if ($invoice->moneybird_invoice_id) {
                    $client->sendInvoice($invoice->moneybird_invoice_id, [
                        'delivery_method' => 'Email',
                    ]);
                    $invoice->update(['status' => 'open']);
                }
            } catch (\Exception $e) {
                \Log::warning("Moneybird invoice sync failed for appointment {$appointment->id}: {$e->getMessage()}");
            }
        }
    }
}
