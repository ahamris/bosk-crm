<?php

namespace App\Services\Moneybird;

use App\Models\Client;
use App\Models\Integration;
use App\Models\Invoice;
use App\Models\Service;

class MoneybirdSync
{
    public function __construct(private MoneybirdClient $client) {}

    /**
     * Sync a client to Moneybird as a contact.
     */
    public function syncContact(Client $client): ?string
    {
        if (!$this->client->isConfigured()) return null;

        $data = [
            'firstname' => $client->first_name,
            'lastname' => $client->last_name,
            'email' => $client->email,
            'phone' => $client->phone,
            'customer_id' => "BOSK-{$client->id}",
        ];

        if ($client->moneybird_contact_id) {
            $result = $this->client->updateContact($client->moneybird_contact_id, $data);
        } else {
            $result = $this->client->createContact($data);
            if (isset($result['id'])) {
                $client->update(['moneybird_contact_id' => $result['id']]);
            }
        }

        return $result['id'] ?? null;
    }

    /**
     * Sync a service to Moneybird as a product.
     */
    public function syncProduct(Service $service): ?string
    {
        if (!$this->client->isConfigured()) return null;

        $integration = Integration::forProvider('moneybird');
        $taxRateId = $integration->settings['tax_rate_id'] ?? null;
        $ledgerAccountId = $integration->settings['ledger_account_id'] ?? null;

        $data = [
            'title' => $service->name_nl,
            'description' => $service->description_nl,
            'price' => number_format($service->price_cents / 100, 2, '.', ''),
            'currency' => 'EUR',
            'identifier' => "BOSK-SVC-{$service->id}",
        ];

        if ($taxRateId) $data['tax_rate_id'] = $taxRateId;
        if ($ledgerAccountId) $data['ledger_account_id'] = $ledgerAccountId;

        if ($service->moneybird_product_id) {
            $result = $this->client->updateProduct($service->moneybird_product_id, $data);
        } else {
            $result = $this->client->createProduct($data);
            if (isset($result['id'])) {
                $service->update(['moneybird_product_id' => $result['id']]);
            }
        }

        return $result['id'] ?? null;
    }

    /**
     * Create an invoice in Moneybird for an appointment.
     */
    public function createInvoice(Invoice $invoice): ?string
    {
        if (!$this->client->isConfigured()) return null;

        // Ensure client is synced
        $client = $invoice->client;
        if (!$client->moneybird_contact_id) {
            $this->syncContact($client);
            $client->refresh();
        }

        if (!$client->moneybird_contact_id) return null;

        $details = $invoice->lines->map(function ($line) {
            return [
                'description' => $line->description,
                'price' => number_format($line->price_cents / 100, 2, '.', ''),
                'amount' => (string) $line->quantity,
            ];
        })->toArray();

        $result = $this->client->createInvoice([
            'contact_id' => $client->moneybird_contact_id,
            'invoice_date' => $invoice->invoice_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
            'due_date' => $invoice->due_date?->format('Y-m-d') ?? now()->addDays(14)->format('Y-m-d'),
            'currency' => 'EUR',
            'details_attributes' => $details,
        ]);

        if (isset($result['id'])) {
            $invoice->update([
                'moneybird_invoice_id' => $result['id'],
                'invoice_number' => $result['invoice_id'] ?? null,
                'status' => 'open',
            ]);
        }

        return $result['id'] ?? null;
    }

    /**
     * Sync all unsynced contacts.
     */
    public function syncAllContacts(): int
    {
        $clients = Client::whereNull('moneybird_contact_id')->get();
        $count = 0;
        foreach ($clients as $client) {
            if ($this->syncContact($client)) $count++;
        }
        return $count;
    }

    /**
     * Sync all unsynced products.
     */
    public function syncAllProducts(): int
    {
        $services = Service::whereNull('moneybird_product_id')->get();
        $count = 0;
        foreach ($services as $service) {
            if ($this->syncProduct($service)) $count++;
        }
        return $count;
    }
}
