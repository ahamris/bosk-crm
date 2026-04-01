<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\CommunicationLog;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CommunicationLogController extends Controller
{
    public function index(Location $location, Client $client)
    {
        abort_if($client->location_id !== $location->id, 404);

        $logs = $client->communicationLogs()
            ->with('user')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $logs]);
    }

    public function store(Request $request, Location $location, Client $client): JsonResponse
    {
        abort_if($client->location_id !== $location->id, 404);

        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['call', 'email', 'sms', 'whatsapp', 'note', 'walk_in'])],
            'direction' => ['sometimes', 'string', Rule::in(['incoming', 'outgoing'])],
            'subject' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string', 'max:5000'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        $log = $client->communicationLogs()->create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(
            ['data' => $log->load('user')],
            201,
        );
    }
}
