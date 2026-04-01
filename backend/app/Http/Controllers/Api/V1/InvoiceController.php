<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Location;
use App\Services\Moneybird\MoneybirdSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * List invoices for a location.
     */
    public function index(Location $location): JsonResponse
    {
        $invoices = $location->invoices()
            ->with(['client', 'appointment', 'lines.service'])
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($invoices);
    }

    /**
     * Create a new invoice.
     */
    public function store(Request $request, Location $location): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'lines' => 'required|array|min:1',
            'lines.*.service_id' => 'nullable|exists:services,id',
            'lines.*.description' => 'required|string',
            'lines.*.quantity' => 'integer|min:1',
            'lines.*.price_cents' => 'required|integer',
        ]);

        $invoice = $location->invoices()->create([
            'client_id' => $validated['client_id'],
            'appointment_id' => $validated['appointment_id'] ?? null,
            'status' => 'draft',
            'invoice_date' => now(),
            'due_date' => now()->addDays(14),
        ]);

        $totalCents = 0;
        foreach ($validated['lines'] as $line) {
            $lineTotalCents = ($line['price_cents']) * ($line['quantity'] ?? 1);
            $totalCents += $lineTotalCents;

            $invoice->lines()->create([
                'service_id' => $line['service_id'] ?? null,
                'description' => $line['description'],
                'quantity' => $line['quantity'] ?? 1,
                'price_cents' => $line['price_cents'],
                'tax_rate' => 21.00,
                'total_cents' => $lineTotalCents,
            ]);
        }

        $taxCents = (int) round($totalCents * 0.21);
        $invoice->update([
            'total_cents' => $totalCents + $taxCents,
            'tax_cents' => $taxCents,
        ]);

        return response()->json($invoice->load(['client', 'lines.service']), 201);
    }

    /**
     * Show a single invoice.
     */
    public function show(Location $location, Invoice $invoice): JsonResponse
    {
        abort_if($invoice->location_id !== $location->id, 404);
        return response()->json($invoice->load(['client', 'appointment', 'lines.service']));
    }

    /**
     * Send invoice to Moneybird and email.
     */
    public function send(Location $location, Invoice $invoice): JsonResponse
    {
        abort_if($invoice->location_id !== $location->id, 404);

        $sync = app(MoneybirdSync::class);
        $moneybirdId = $sync->createInvoice($invoice);

        if ($moneybirdId) {
            return response()->json([
                'message' => 'Invoice sent to Moneybird.',
                'moneybird_invoice_id' => $moneybirdId,
                'invoice' => $invoice->fresh(['client', 'lines.service']),
            ]);
        }

        return response()->json(['message' => 'Invoice created locally (Moneybird not configured).'], 200);
    }

    /**
     * Mark invoice as paid.
     */
    public function markPaid(Location $location, Invoice $invoice): JsonResponse
    {
        abort_if($invoice->location_id !== $location->id, 404);

        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return response()->json(['message' => 'Invoice marked as paid.', 'invoice' => $invoice]);
    }

    /**
     * Quick invoice from appointment — creates invoice with service as line item.
     */
    public function fromAppointment(Request $request, Location $location, Appointment $appointment): JsonResponse
    {
        abort_if($appointment->location_id !== $location->id, 404);

        // Check if invoice already exists
        $existing = Invoice::where('appointment_id', $appointment->id)->first();
        if ($existing) {
            return response()->json(['message' => 'Invoice already exists for this appointment.', 'invoice' => $existing], 409);
        }

        $service = $appointment->service;

        $invoice = $location->invoices()->create([
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

        return response()->json($invoice->load(['client', 'lines.service']), 201);
    }
}
