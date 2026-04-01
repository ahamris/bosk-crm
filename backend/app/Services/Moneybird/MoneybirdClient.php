<?php

namespace App\Services\Moneybird;

use App\Models\Integration;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class MoneybirdClient
{
    private ?string $token;
    private ?string $administrationId;
    private string $baseUrl = 'https://moneybird.com/api/v2';

    public function __construct()
    {
        $integration = Integration::forProvider('moneybird');
        $this->token = $integration?->settings['api_token'] ?? null;
        $this->administrationId = $integration?->settings['administration_id'] ?? null;
    }

    public function isConfigured(): bool
    {
        return $this->token && $this->administrationId;
    }

    private function http(): PendingRequest
    {
        return Http::withToken($this->token)
            ->baseUrl("{$this->baseUrl}/{$this->administrationId}")
            ->acceptJson()
            ->asJson();
    }

    // Contacts
    public function listContacts(int $page = 1): array
    {
        return $this->http()->get('/contacts', ['page' => $page, 'per_page' => 100])->json();
    }

    public function createContact(array $data): array
    {
        return $this->http()->post('/contacts', ['contact' => $data])->json();
    }

    public function updateContact(string $id, array $data): array
    {
        return $this->http()->patch("/contacts/{$id}", ['contact' => $data])->json();
    }

    public function findContactByCustomerId(string $customerId): ?array
    {
        $response = $this->http()->get("/contacts/customer_id/{$customerId}");
        return $response->successful() ? $response->json() : null;
    }

    // Products (Services in Moneybird)
    public function listProducts(): array
    {
        return $this->http()->get('/products')->json();
    }

    public function createProduct(array $data): array
    {
        return $this->http()->post('/products', ['product' => $data])->json();
    }

    public function updateProduct(string $id, array $data): array
    {
        return $this->http()->patch("/products/{$id}", ['product' => $data])->json();
    }

    // Sales Invoices
    public function createInvoice(array $data): array
    {
        return $this->http()->post('/sales_invoices', ['sales_invoice' => $data])->json();
    }

    public function sendInvoice(string $id, array $data = []): array
    {
        return $this->http()->patch("/sales_invoices/{$id}/send_invoice", ['sales_invoice_sending' => $data])->json();
    }

    public function registerPayment(string $id, array $data): array
    {
        return $this->http()->patch("/sales_invoices/{$id}/register_payment", ['payment' => $data])->json();
    }

    public function getInvoice(string $id): array
    {
        return $this->http()->get("/sales_invoices/{$id}")->json();
    }

    // Tax Rates
    public function getTaxRates(): array
    {
        return $this->http()->get('/tax_rates')->json();
    }

    // Ledger Accounts
    public function getLedgerAccounts(): array
    {
        return $this->http()->get('/ledger_accounts')->json();
    }

    // Administration
    public function getAdministrations(): array
    {
        return Http::withToken($this->token)
            ->baseUrl($this->baseUrl)
            ->acceptJson()
            ->get('/administrations')
            ->json();
    }

    // Test connection
    public function testConnection(): bool
    {
        try {
            $admins = $this->getAdministrations();
            return is_array($admins) && count($admins) > 0;
        } catch (\Exception $e) {
            return false;
        }
    }
}
