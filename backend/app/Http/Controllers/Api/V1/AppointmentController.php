<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreAppointmentRequest;
use App\Http\Requests\V1\UpdateAppointmentRequest;
use App\Http\Resources\V1\AppointmentResource;
use App\Models\Appointment;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AppointmentController extends Controller
{
    public function index(Request $request, Location $location): AnonymousResourceCollection
    {
        $query = $location->appointments()
            ->with(['client', 'employee', 'service']);

        // Filter by date range
        if ($date = $request->query('date')) {
            $query->whereDate('starts_at', $date);
        } elseif ($from = $request->query('from')) {
            $query->where('starts_at', '>=', $from);
            if ($to = $request->query('to')) {
                $query->where('starts_at', '<=', $to);
            }
        }

        // Filter by employee
        if ($employeeId = $request->query('employee_id')) {
            $query->where('user_id', $employeeId);
        }

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $appointments = $query
            ->orderBy('starts_at')
            ->paginate(50);

        return AppointmentResource::collection($appointments);
    }

    public function store(StoreAppointmentRequest $request, Location $location): JsonResponse
    {
        $appointment = $location->appointments()->create(
            array_merge($request->validated(), [
                'status' => $request->input('status', Appointment::STATUS_SCHEDULED),
            ])
        );

        return response()->json(
            new AppointmentResource($appointment->load(['client', 'employee', 'service'])),
            201,
        );
    }

    public function show(Location $location, Appointment $appointment): AppointmentResource
    {
        $this->ensureBelongsToLocation($appointment, $location);

        return new AppointmentResource(
            $appointment->load(['client', 'employee', 'service'])
        );
    }

    public function update(UpdateAppointmentRequest $request, Location $location, Appointment $appointment): AppointmentResource
    {
        $this->ensureBelongsToLocation($appointment, $location);

        $data = $request->validated();

        // Handle status transitions
        if (isset($data['status']) && $data['status'] !== $appointment->status) {
            if (! $appointment->canTransitionTo($data['status'])) {
                abort(422, "Cannot transition from '{$appointment->status}' to '{$data['status']}'.");
            }

            if ($data['status'] === Appointment::STATUS_CANCELLED) {
                $data['cancelled_at'] = now();
            }
        }

        $appointment->update($data);

        return new AppointmentResource(
            $appointment->load(['client', 'employee', 'service'])
        );
    }

    public function transition(Request $request, Location $location, Appointment $appointment): AppointmentResource
    {
        $this->ensureBelongsToLocation($appointment, $location);

        $validated = $request->validate([
            'status' => 'required|string|in:' . implode(',', Appointment::STATUSES),
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        if (!$appointment->canTransitionTo($validated['status'])) {
            abort(422, "Cannot transition from '{$appointment->status}' to '{$validated['status']}'.");
        }

        $data = ['status' => $validated['status']];

        if ($validated['status'] === Appointment::STATUS_CANCELLED) {
            $data['cancelled_at'] = now();
            $data['cancellation_reason'] = $validated['cancellation_reason'] ?? null;

            // Check if this is a late cancellation
            $settings = $location->bookingSetting;
            $windowHours = $settings?->cancellation_window_hours ?? 24;

            if ($appointment->starts_at && $appointment->starts_at->diffInHours(now(), false) > -$windowHours) {
                // Late cancel — within the cancellation window
                $client = $appointment->client;
                if ($client) {
                    $client->increment('late_cancel_count');
                    if ($client->late_cancel_count >= 3) {
                        $client->update(['requires_deposit' => true]);
                    }
                }
            }
        }

        if ($validated['status'] === Appointment::STATUS_NO_SHOW) {
            $client = $appointment->client;
            if ($client) {
                $client->increment('no_show_count');
                if ($client->no_show_count >= 2) {
                    $client->update(['requires_deposit' => true]);
                }
                if ($client->no_show_count >= 3) {
                    $client->update(['requires_prepayment' => true]);
                }
            }
        }

        $appointment->update($data);

        return new AppointmentResource(
            $appointment->load(['client', 'employee', 'service'])
        );
    }

    public function destroy(Location $location, Appointment $appointment): JsonResponse
    {
        $this->ensureBelongsToLocation($appointment, $location);

        $appointment->delete();

        return response()->json(null, 204);
    }

    private function ensureBelongsToLocation(Appointment $appointment, Location $location): void
    {
        abort_if($appointment->location_id !== $location->id, 404);
    }
}
