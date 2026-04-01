<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmployeeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::query()
            ->whereHas('employeeProfiles')
            ->with(['employeeProfile', 'roles']);

        if ($locationId = $request->query('location_id')) {
            $query->whereHas('employeeProfiles', function ($q) use ($locationId) {
                $q->where('location_id', $locationId);
            });
        }

        $employees = $query->orderBy('name')->paginate(25);

        return UserResource::collection($employees);
    }

    public function show(User $employee): UserResource
    {
        return new UserResource(
            $employee->load(['employeeProfile', 'roles', 'workingHours'])
        );
    }

    public function availability(Request $request, User $employee)
    {
        $date = $request->query('date', now()->toDateString());

        $dayOfWeek = (int) now()->parse($date)->dayOfWeek;

        $workingHours = $employee->workingHours()
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->get();

        $appointments = $employee->appointments()
            ->whereDate('starts_at', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->orderBy('starts_at')
            ->get(['starts_at', 'ends_at', 'status']);

        return response()->json([
            'date' => $date,
            'day_of_week' => $dayOfWeek,
            'working_hours' => $workingHours->map(fn ($wh) => [
                'start_time' => $wh->start_time,
                'end_time' => $wh->end_time,
                'location_id' => $wh->location_id,
            ]),
            'appointments' => $appointments->map(fn ($apt) => [
                'starts_at' => $apt->starts_at,
                'ends_at' => $apt->ends_at,
                'status' => $apt->status,
            ]),
        ]);
    }
}
