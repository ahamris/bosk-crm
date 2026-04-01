<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreWorkingHourRequest;
use App\Http\Requests\V1\UpdateWorkingHourRequest;
use App\Http\Resources\V1\WorkingHourResource;
use App\Models\User;
use App\Models\WorkingHour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WorkingHourController extends Controller
{
    public function index(User $employee): AnonymousResourceCollection
    {
        $workingHours = $employee->workingHours()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return WorkingHourResource::collection($workingHours);
    }

    public function store(StoreWorkingHourRequest $request, User $employee): JsonResponse
    {
        $workingHour = $employee->workingHours()->create($request->validated());

        return response()->json(
            new WorkingHourResource($workingHour),
            201,
        );
    }

    public function show(User $employee, WorkingHour $workingHour): WorkingHourResource
    {
        abort_if($workingHour->user_id !== $employee->id, 404);

        return new WorkingHourResource($workingHour);
    }

    public function update(UpdateWorkingHourRequest $request, User $employee, WorkingHour $workingHour): WorkingHourResource
    {
        abort_if($workingHour->user_id !== $employee->id, 404);

        $workingHour->update($request->validated());

        return new WorkingHourResource($workingHour);
    }

    public function destroy(User $employee, WorkingHour $workingHour): JsonResponse
    {
        abort_if($workingHour->user_id !== $employee->id, 404);

        $workingHour->delete();

        return response()->json(null, 204);
    }
}
