<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Handle Moneybird webhooks.
     * Called by Moneybird when invoice state changes, payments registered, etc.
     */
    public function moneybird(Request $request): JsonResponse
    {
        $payload = $request->all();
        $action = $payload['action'] ?? null;
        $entityType = $payload['entity_type'] ?? null;
        $entityId = (string) ($payload['entity_id'] ?? '');
        $state = $payload['state'] ?? null;

        Log::info("Moneybird webhook: {$action} {$entityType} {$entityId}", $payload);

        if ($entityType === 'SalesInvoice') {
            $this->handleInvoiceWebhook($action, $entityId, $state, $payload);
        }

        if ($entityType === 'Contact') {
            $this->handleContactWebhook($action, $entityId, $payload);
        }

        return response()->json(['status' => 'ok']);
    }

    private function handleInvoiceWebhook(string $action, string $entityId, ?string $state, array $payload): void
    {
        $invoice = Invoice::where('moneybird_invoice_id', $entityId)->first();
        if (!$invoice) return;

        // Map Moneybird states to our states
        $stateMap = [
            'open' => 'open',
            'pending_payment' => 'open',
            'paid' => 'paid',
            'late' => 'late',
            'reminded' => 'late',
            'uncollectible' => 'late',
        ];

        if ($state && isset($stateMap[$state])) {
            $newStatus = $stateMap[$state];
            $invoice->update([
                'status' => $newStatus,
                'paid_at' => $newStatus === 'paid' ? now() : $invoice->paid_at,
            ]);

            // Create notification for payment received
            if ($newStatus === 'paid') {
                $client = $invoice->client;
                Notification::create([
                    'user_id' => 1, // admin — ideally notify the location owner
                    'type' => 'payment_received',
                    'title' => "Betaling ontvangen van {$client?->full_name}",
                    'message' => "Factuur #{$invoice->invoice_number} is betaald (\u{20AC}" . number_format($invoice->total_cents / 100, 2, ',', '.') . ")",
                    'data' => [
                        'invoice_id' => $invoice->id,
                        'client_id' => $invoice->client_id,
                        'amount_cents' => $invoice->total_cents,
                    ],
                ]);
            }
        }
    }

    private function handleContactWebhook(string $action, string $entityId, array $payload): void
    {
        // For now just log — we could sync changes back from Moneybird if needed
        Log::info("Moneybird contact webhook: {$action} for contact {$entityId}");
    }
}
