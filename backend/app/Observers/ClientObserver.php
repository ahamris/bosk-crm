<?php

namespace App\Observers;

use App\Models\Client;
use App\Models\Integration;
use App\Services\Moneybird\MoneybirdSync;

class ClientObserver
{
    public function created(Client $client): void
    {
        $this->syncToMoneybird($client);
    }

    public function updated(Client $client): void
    {
        $this->syncToMoneybird($client);
    }

    private function syncToMoneybird(Client $client): void
    {
        $integration = Integration::forProvider('moneybird');
        if (!$integration?->is_active) return;

        try {
            app(MoneybirdSync::class)->syncContact($client);
        } catch (\Exception $e) {
            \Log::warning("Moneybird sync failed for client {$client->id}: {$e->getMessage()}");
        }
    }
}
