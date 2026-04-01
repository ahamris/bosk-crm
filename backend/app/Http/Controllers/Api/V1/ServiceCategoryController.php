<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreServiceCategoryRequest;
use App\Http\Requests\V1\UpdateServiceCategoryRequest;
use App\Http\Resources\V1\ServiceCategoryResource;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceCategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $categories = ServiceCategory::query()
            ->with('services')
            ->withCount('services')
            ->orderBy('sort_order')
            ->paginate(25);

        return ServiceCategoryResource::collection($categories);
    }

    public function store(StoreServiceCategoryRequest $request): JsonResponse
    {
        $category = ServiceCategory::create($request->validated());

        return response()->json(
            new ServiceCategoryResource($category),
            201,
        );
    }

    public function show(ServiceCategory $serviceCategory): ServiceCategoryResource
    {
        return new ServiceCategoryResource(
            $serviceCategory->loadCount('services')->load('services')
        );
    }

    public function update(UpdateServiceCategoryRequest $request, ServiceCategory $serviceCategory): ServiceCategoryResource
    {
        $serviceCategory->update($request->validated());

        return new ServiceCategoryResource($serviceCategory);
    }

    public function destroy(ServiceCategory $serviceCategory): JsonResponse
    {
        $serviceCategory->delete();

        return response()->json(null, 204);
    }
}
