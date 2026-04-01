<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Services\Moneybird\MoneybirdClient;
use App\Services\Moneybird\MoneybirdSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    /**
     * List all integrations (configured + available).
     */
    public function index(): JsonResponse
    {
        $integrations = Integration::all();

        // Add available integrations that haven't been configured yet
        $available = collect([
            ['provider' => 'moneybird', 'name' => 'Moneybird', 'description' => 'Invoicing & accounting', 'icon' => 'moneybird'],
            ['provider' => 'mollie', 'name' => 'Mollie', 'description' => 'Payment processing', 'icon' => 'mollie'],
            ['provider' => 'google_calendar', 'name' => 'Google Calendar', 'description' => 'Calendar sync', 'icon' => 'google'],
            ['provider' => 'mailchimp', 'name' => 'Mailchimp', 'description' => 'Email marketing', 'icon' => 'mailchimp'],
        ]);

        return response()->json([
            'configured' => $integrations,
            'available' => $available,
        ]);
    }

    /**
     * Get integration details by provider.
     */
    public function show(string $provider): JsonResponse
    {
        $integration = Integration::where('provider', $provider)->first();

        return response()->json([
            'integration' => $integration,
            'is_configured' => (bool) $integration?->is_active,
        ]);
    }

    /**
     * Save integration settings.
     */
    public function update(Request $request, string $provider): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'is_active' => 'boolean',
        ]);

        $integration = Integration::updateOrCreate(
            ['provider' => $provider],
            [
                'name' => ucfirst($provider),
                'settings' => $validated['settings'],
                'is_active' => $validated['is_active'] ?? false,
            ]
        );

        return response()->json(['integration' => $integration]);
    }

    /**
     * Test connection for a provider.
     */
    public function testConnection(string $provider): JsonResponse
    {
        if ($provider === 'moneybird') {
            $client = app(MoneybirdClient::class);
            $success = $client->testConnection();

            if ($success) {
                $admins = $client->getAdministrations();
                return response()->json([
                    'success' => true,
                    'administrations' => collect($admins)->map(fn ($a) => [
                        'id' => $a['id'],
                        'name' => $a['name'],
                    ]),
                ]);
            }

            return response()->json(['success' => false, 'message' => 'Could not connect to Moneybird.'], 422);
        }

        return response()->json(['success' => false, 'message' => 'Unknown provider.'], 404);
    }

    /**
     * Moneybird: sync contacts.
     */
    public function syncContacts(Request $request): JsonResponse
    {
        $sync = app(MoneybirdSync::class);
        $count = $sync->syncAllContacts();

        return response()->json([
            'message' => "Synced {$count} contacts to Moneybird.",
            'count' => $count,
        ]);
    }

    /**
     * Moneybird: sync products (services).
     */
    public function syncProducts(Request $request): JsonResponse
    {
        $sync = app(MoneybirdSync::class);
        $count = $sync->syncAllProducts();

        return response()->json([
            'message' => "Synced {$count} products to Moneybird.",
            'count' => $count,
        ]);
    }

    /**
     * Moneybird: get tax rates and ledger accounts for settings.
     */
    public function moneybirdConfig(): JsonResponse
    {
        $client = app(MoneybirdClient::class);

        if (!$client->isConfigured()) {
            return response()->json(['message' => 'Moneybird is not configured.'], 422);
        }

        return response()->json([
            'tax_rates' => $client->getTaxRates(),
            'ledger_accounts' => $client->getLedgerAccounts(),
        ]);
    }
}
