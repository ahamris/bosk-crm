<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\CommunicationLog;
use App\Services\Messaging\WhatsAppClient;
use App\Services\Messaging\TelegramClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessagingController extends Controller
{
    // Send message to client via WhatsApp or Telegram
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'channel' => 'required|in:whatsapp,telegram',
            'message' => 'required|string|max:4096',
        ]);

        $client = Client::findOrFail($validated['client_id']);

        if ($validated['channel'] === 'whatsapp') {
            $wa = app(WhatsAppClient::class);
            if (!$wa->isConfigured() || !$client->phone) {
                return response()->json(['message' => 'WhatsApp not configured or client has no phone.'], 422);
            }
            $result = $wa->sendText($client->phone, $validated['message']);
        } else {
            $tg = app(TelegramClient::class);
            $chatId = $client->telegram_chat_id ?? null;
            if (!$tg->isConfigured() || !$chatId) {
                return response()->json(['message' => 'Telegram not configured or client has no chat ID.'], 422);
            }
            $result = $tg->sendMessage($chatId, $validated['message']);
        }

        // Log the communication
        CommunicationLog::create([
            'client_id' => $client->id,
            'user_id' => $request->user()->id,
            'type' => $validated['channel'],
            'direction' => 'outgoing',
            'content' => $validated['message'],
        ]);

        return response()->json([
            'message' => 'Message sent.',
            'result' => $result,
        ]);
    }

    // Send appointment confirmation via preferred channel
    public function sendConfirmation(Request $request, Appointment $appointment): JsonResponse
    {
        $appointment->load(['client', 'service', 'location']);
        $client = $appointment->client;

        if (!$client?->phone) {
            return response()->json(['message' => 'Client has no phone number.'], 422);
        }

        $service = $appointment->service;
        $date = $appointment->starts_at->format('d-m-Y');
        $time = $appointment->starts_at->format('H:i');
        $ref = $appointment->booking_reference ?? "BOSK-{$appointment->id}";

        $wa = app(WhatsAppClient::class);
        if ($wa->isConfigured()) {
            $wa->sendBookingConfirmation(
                $client->phone, $client->first_name, $service->name_nl, $date, $time, $ref
            );

            CommunicationLog::create([
                'client_id' => $client->id,
                'user_id' => $request->user()->id,
                'type' => 'whatsapp',
                'direction' => 'outgoing',
                'subject' => 'Booking confirmation',
                'content' => "Afspraak bevestigd: {$service->name_nl} op {$date} om {$time}",
            ]);

            return response()->json(['message' => 'Confirmation sent via WhatsApp.']);
        }

        return response()->json(['message' => 'No messaging channel configured.'], 422);
    }

    // Webhook for incoming WhatsApp messages
    public function whatsappWebhook(Request $request): JsonResponse
    {
        \Log::info('WhatsApp webhook received', $request->all());
        // Process incoming messages, auto-reply, etc.
        return response()->json(['status' => 'ok']);
    }

    // Webhook for incoming Telegram messages
    public function telegramWebhook(Request $request): JsonResponse
    {
        \Log::info('Telegram webhook received', $request->all());
        // Process incoming messages, auto-reply, etc.
        return response()->json(['status' => 'ok']);
    }
}
