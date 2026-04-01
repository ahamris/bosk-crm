<?php

namespace App\Services\Messaging;

use App\Models\Integration;
use Illuminate\Support\Facades\Http;

class TelegramClient
{
    private ?string $botToken;
    private string $baseUrl = 'https://api.telegram.org';

    public function __construct()
    {
        $integration = Integration::forProvider('telegram');
        $this->botToken = $integration?->settings['bot_token'] ?? null;
    }

    public function isConfigured(): bool
    {
        return (bool) $this->botToken;
    }

    // Send message to a chat
    public function sendMessage(string $chatId, string $text, string $parseMode = 'HTML'): array
    {
        return Http::post("{$this->baseUrl}/bot{$this->botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => $parseMode,
        ])->json();
    }

    // Send booking confirmation
    public function sendBookingConfirmation(string $chatId, string $clientName, string $service, string $date, string $time, string $reference): array
    {
        $text = "<b>✅ Afspraak Bevestigd</b>\n\n"
            . "👤 {$clientName}\n"
            . "💆 {$service}\n"
            . "📅 {$date}\n"
            . "🕐 {$time}\n"
            . "📌 {$reference}";

        return $this->sendMessage($chatId, $text);
    }

    // Send daily schedule to staff
    public function sendDailySchedule(string $chatId, string $date, array $appointments): array
    {
        $text = "<b>📋 Planning {$date}</b>\n\n";

        if (empty($appointments)) {
            $text .= "Geen afspraken vandaag.";
        } else {
            foreach ($appointments as $apt) {
                $text .= "🕐 {$apt['time']} — {$apt['client']} — {$apt['service']}\n";
            }
        }

        return $this->sendMessage($chatId, $text);
    }

    // Set webhook for incoming messages
    public function setWebhook(string $url): array
    {
        return Http::post("{$this->baseUrl}/bot{$this->botToken}/setWebhook", [
            'url' => $url,
        ])->json();
    }

    // Get bot info (test connection)
    public function testConnection(): bool
    {
        try {
            $response = Http::get("{$this->baseUrl}/bot{$this->botToken}/getMe");
            return $response->successful() && ($response->json()['ok'] ?? false);
        } catch (\Exception) {
            return false;
        }
    }
}
