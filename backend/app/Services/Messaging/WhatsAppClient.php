<?php

namespace App\Services\Messaging;

use App\Models\Integration;
use Illuminate\Support\Facades\Http;

class WhatsAppClient
{
    private ?string $token;
    private ?string $phoneNumberId;
    private string $baseUrl = 'https://graph.facebook.com/v18.0';

    public function __construct()
    {
        $integration = Integration::forProvider('whatsapp');
        $this->token = $integration?->settings['access_token'] ?? null;
        $this->phoneNumberId = $integration?->settings['phone_number_id'] ?? null;
    }

    public function isConfigured(): bool
    {
        return $this->token && $this->phoneNumberId;
    }

    // Send template message (appointment confirmation, reminder, etc.)
    public function sendTemplate(string $to, string $templateName, array $parameters = []): array
    {
        return Http::withToken($this->token)
            ->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $this->formatPhone($to),
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => ['code' => 'nl'],
                    'components' => !empty($parameters) ? [[
                        'type' => 'body',
                        'parameters' => array_map(fn($p) => ['type' => 'text', 'text' => $p], $parameters),
                    ]] : [],
                ],
            ])->json();
    }

    // Send text message
    public function sendText(string $to, string $message): array
    {
        return Http::withToken($this->token)
            ->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $this->formatPhone($to),
                'type' => 'text',
                'text' => ['body' => $message],
            ])->json();
    }

    // Send appointment confirmation
    public function sendBookingConfirmation(string $to, string $clientName, string $service, string $date, string $time, string $reference): array
    {
        $message = "Beste {$clientName},\n\nUw afspraak is bevestigd:\n\n"
            . "📋 {$service}\n"
            . "📅 {$date}\n"
            . "🕐 {$time}\n"
            . "📌 Ref: {$reference}\n\n"
            . "Tot dan!\nBOSK Gouda";

        return $this->sendText($to, $message);
    }

    // Send appointment reminder
    public function sendReminder(string $to, string $clientName, string $service, string $date, string $time): array
    {
        $message = "Herinnering: {$clientName}, morgen heeft u een afspraak:\n\n"
            . "📋 {$service}\n"
            . "📅 {$date}\n"
            . "🕐 {$time}\n\n"
            . "Annuleren? Neem contact op.\nBOSK Gouda";

        return $this->sendText($to, $message);
    }

    // Send review request
    public function sendReviewRequest(string $to, string $clientName, string $service, string $reviewUrl): array
    {
        $message = "Hoi {$clientName}!\n\n"
            . "Bedankt voor uw bezoek. We horen graag hoe u de {$service} heeft ervaren.\n\n"
            . "⭐ Laat een review achter:\n{$reviewUrl}\n\n"
            . "BOSK Gouda";

        return $this->sendText($to, $message);
    }

    private function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '31' . substr($phone, 1);
        }
        if (!str_starts_with($phone, '31')) {
            $phone = '31' . $phone;
        }
        return $phone;
    }

    public function testConnection(): bool
    {
        try {
            $response = Http::withToken($this->token)
                ->get("{$this->baseUrl}/{$this->phoneNumberId}");
            return $response->successful();
        } catch (\Exception) {
            return false;
        }
    }
}
