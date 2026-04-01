<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::query()
            ->whereHas('employeeProfiles')
            ->with(['employeeProfile', 'roles'])
            ->withCount(['reviews', 'workingHours'])
            ->withAvg('reviews', 'rating');

        if ($locationId = $request->query('location_id')) {
            $query->whereHas('employeeProfiles', function ($q) use ($locationId) {
                $q->where('location_id', $locationId);
            });
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $employees = $query->orderBy('name')->paginate(25);

        return UserResource::collection($employees);
    }

    public function show(User $employee): UserResource
    {
        return new UserResource(
            $employee->load(['employeeProfile', 'roles', 'workingHours', 'reviews.client'])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:50',
            'type' => ['required', Rule::in(['staff', 'freelancer'])],
            'bio_nl' => 'nullable|string',
            'bio_en' => 'nullable|string',
            'bio_ru' => 'nullable|string',
            'specializations' => 'nullable|array',
            'specializations.*' => 'string',
            'is_active' => 'boolean',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        $employee = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'type' => $validated['type'],
            ]);

            $user->assignRole('employee');

            EmployeeProfile::create([
                'user_id' => $user->id,
                'location_id' => $validated['location_id'] ?? 1,
                'bio_nl' => $validated['bio_nl'] ?? null,
                'bio_en' => $validated['bio_en'] ?? null,
                'bio_ru' => $validated['bio_ru'] ?? null,
                'specializations' => $validated['specializations'] ?? [],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            return $user;
        });

        return response()->json(
            new UserResource($employee->load(['employeeProfile', 'roles'])),
            201,
        );
    }

    public function update(Request $request, User $employee): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($employee->id)],
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:50',
            'type' => ['sometimes', Rule::in(['staff', 'freelancer'])],
            'bio_nl' => 'nullable|string',
            'bio_en' => 'nullable|string',
            'bio_ru' => 'nullable|string',
            'specializations' => 'nullable|array',
            'specializations.*' => 'string',
            'is_active' => 'boolean',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        DB::transaction(function () use ($employee, $validated) {
            $userFields = array_filter([
                'name' => $validated['name'] ?? null,
                'email' => $validated['email'] ?? null,
                'type' => $validated['type'] ?? null,
            ], fn ($v) => $v !== null);

            if (!empty($validated['password'])) {
                $userFields['password'] = Hash::make($validated['password']);
            }

            if (!empty($userFields)) {
                $employee->update($userFields);
            }

            $profile = $employee->employeeProfile;
            if ($profile) {
                $profileFields = [];
                if (array_key_exists('bio_nl', $validated)) $profileFields['bio_nl'] = $validated['bio_nl'];
                if (array_key_exists('bio_en', $validated)) $profileFields['bio_en'] = $validated['bio_en'];
                if (array_key_exists('bio_ru', $validated)) $profileFields['bio_ru'] = $validated['bio_ru'];
                if (array_key_exists('specializations', $validated)) $profileFields['specializations'] = $validated['specializations'] ?? [];
                if (array_key_exists('is_active', $validated)) $profileFields['is_active'] = $validated['is_active'];
                if (array_key_exists('location_id', $validated)) $profileFields['location_id'] = $validated['location_id'];

                if (!empty($profileFields)) {
                    $profile->update($profileFields);
                }
            }
        });

        return response()->json(
            new UserResource($employee->fresh()->load(['employeeProfile', 'roles'])),
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
