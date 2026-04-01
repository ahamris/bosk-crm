<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreWorkingHourRequest;
use App\Http\Requests\V1\UpdateWorkingHourRequest;
use App\Http\Resources\V1\WorkingHourResource;
use App\Models\User;
use App\Models\WorkingHour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    public function bulkUpdate(Request $request, User $employee): JsonResponse
    {
        $validated = $request->validate([
            'hours' => 'required|array',
            'hours.*.day_of_week' => 'required|integer|min:0|max:6',
            'hours.*.start_time' => 'required|date_format:H:i',
            'hours.*.end_time' => 'required|date_format:H:i',
            'hours.*.is_available' => 'required|boolean',
            'hours.*.location_id' => 'required|exists:locations,id',
        ]);

        foreach ($validated['hours'] as $hour) {
            WorkingHour::updateOrCreate(
                [
                    'user_id' => $employee->id,
                    'location_id' => $hour['location_id'],
                    'day_of_week' => $hour['day_of_week'],
                ],
                [
                    'start_time' => $hour['start_time'],
                    'end_time' => $hour['end_time'],
                    'is_available' => $hour['is_available'],
                ]
            );
        }

        return response()->json([
            'message' => 'Working hours updated.',
            'hours' => WorkingHourResource::collection($employee->workingHours()->orderBy('day_of_week')->orderBy('start_time')->get()),
        ]);
    }
}
