<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreClientRequest;
use App\Http\Requests\V1\UpdateClientRequest;
use App\Http\Resources\V1\ClientResource;
use App\Models\Client;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    public function index(Request $request, Location $location): AnonymousResourceCollection
    {
        $query = $location->clients()
            ->withCount('appointments');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $clients = $query->orderBy('last_name')->paginate(25);

        return ClientResource::collection($clients);
    }

    public function store(StoreClientRequest $request, Location $location): JsonResponse
    {
        $client = $location->clients()->create($request->validated());

        return response()->json(
            new ClientResource($client),
            201,
        );
    }

    public function show(Location $location, Client $client): ClientResource
    {
        $this->ensureBelongsToLocation($client, $location);

        return new ClientResource(
            $client->loadCount('appointments')->load('clientNotes.author')
        );
    }

    public function update(UpdateClientRequest $request, Location $location, Client $client): ClientResource
    {
        $this->ensureBelongsToLocation($client, $location);

        $client->update($request->validated());

        return new ClientResource($client);
    }

    public function destroy(Location $location, Client $client): JsonResponse
    {
        $this->ensureBelongsToLocation($client, $location);

        $client->delete();

        return response()->json(null, 204);
    }

    private function ensureBelongsToLocation(Client $client, Location $location): void
    {
        abort_if($client->location_id !== $location->id, 404);
    }
}
