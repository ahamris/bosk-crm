<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreServiceRequest;
use App\Http\Requests\V1\UpdateServiceRequest;
use App\Http\Resources\V1\ServiceResource;
use App\Models\Location;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    public function index(Location $location): AnonymousResourceCollection
    {
        $services = $location->services()
            ->with('category')
            ->orderBy('name_nl')
            ->paginate(25);

        return ServiceResource::collection($services);
    }

    public function store(StoreServiceRequest $request, Location $location): JsonResponse
    {
        $service = $location->services()->create($request->validated());

        return response()->json(
            new ServiceResource($service->load('category')),
            201,
        );
    }

    public function show(Location $location, Service $service): ServiceResource
    {
        $this->ensureBelongsToLocation($service, $location);

        return new ServiceResource($service->load('category'));
    }

    public function update(UpdateServiceRequest $request, Location $location, Service $service): ServiceResource
    {
        $this->ensureBelongsToLocation($service, $location);

        $service->update($request->validated());

        return new ServiceResource($service->load('category'));
    }

    public function destroy(Location $location, Service $service): JsonResponse
    {
        $this->ensureBelongsToLocation($service, $location);

        $service->delete();

        return response()->json(null, 204);
    }

    private function ensureBelongsToLocation(Service $service, Location $location): void
    {
        abort_if($service->location_id !== $location->id, 404);
    }
}
