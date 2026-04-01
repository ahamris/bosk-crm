<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ClientNoteResource;
use App\Models\Client;
use App\Models\ClientNote;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientNoteController extends Controller
{
    public function index(Location $location, Client $client)
    {
        abort_if($client->location_id !== $location->id, 404);

        $notes = $client->clientNotes()
            ->with('author')
            ->orderByDesc('created_at')
            ->get();

        return ClientNoteResource::collection($notes);
    }

    public function store(Request $request, Location $location, Client $client): JsonResponse
    {
        abort_if($client->location_id !== $location->id, 404);

        $validated = $request->validate([
            'note' => 'required|string|max:5000',
            'is_private' => 'boolean',
        ]);

        $note = $client->clientNotes()->create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(
            new ClientNoteResource($note->load('author')),
            201,
        );
    }

    public function destroy(Location $location, Client $client, ClientNote $clientNote): JsonResponse
    {
        abort_if($client->location_id !== $location->id, 404);
        abort_if($clientNote->client_id !== $client->id, 404);

        $clientNote->delete();

        return response()->json(null, 204);
    }
}
