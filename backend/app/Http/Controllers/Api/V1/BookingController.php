<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\AppointmentResource;
use App\Http\Resources\V1\ServiceResource;
use App\Models\Appointment;
use App\Models\Location;
use App\Models\Service;
use App\Models\User;
use App\Models\WorkingHour;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Get location info + services for public booking widget.
     */
    public function services(Location $location)
    {
        $services = $location->services()
            ->with('category')
            ->where('is_active', true)
            ->orderBy('service_category_id')
            ->get();

        return response()->json([
            'location' => [
                'id' => $location->id,
                'name' => $location->name,
                'address' => $location->address,
                'city' => $location->city,
            ],
            'services' => ServiceResource::collection($services),
        ]);
    }

    /**
     * Get available time slots for a service on a given date.
     */
    public function availability(Request $request, Location $location): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date|after_or_equal:today',
            'employee_id' => 'nullable|exists:users,id',
        ]);

        $service = Service::findOrFail($validated['service_id']);
        $date = Carbon::parse($validated['date']);
        $dayOfWeek = $date->dayOfWeekIso - 1; // 0=Monday

        // Get employees who work on this day
        $workingHours = WorkingHour::where('location_id', $location->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->when(isset($validated['employee_id']), fn ($q) => $q->where('user_id', $validated['employee_id']))
            ->with('user')
            ->get();

        $slots = [];

        foreach ($workingHours as $wh) {
            $start = Carbon::parse($date->format('Y-m-d').' '.$wh->start_time);
            $end = Carbon::parse($date->format('Y-m-d').' '.$wh->end_time);
            $duration = $service->duration_minutes + $service->buffer_minutes;

            // Get existing appointments for this employee on this date
            $existingAppointments = Appointment::where('user_id', $wh->user_id)
                ->whereDate('starts_at', $date)
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->orderBy('starts_at')
                ->get();

            $current = $start->copy();
            while ($current->copy()->addMinutes($service->duration_minutes)->lte($end)) {
                $slotEnd = $current->copy()->addMinutes($service->duration_minutes);

                // Check for conflicts
                $conflict = $existingAppointments->first(function ($apt) use ($current, $slotEnd) {
                    return $current->lt($apt->ends_at) && $slotEnd->gt($apt->starts_at);
                });

                if (! $conflict) {
                    $slots[] = [
                        'employee_id' => $wh->user_id,
                        'employee_name' => $wh->user->name,
                        'start' => $current->format('H:i'),
                        'end' => $slotEnd->format('H:i'),
                    ];
                }

                $current->addMinutes(15); // 15-minute intervals
            }
        }

        return response()->json([
            'date' => $date->format('Y-m-d'),
            'service_id' => $service->id,
            'duration_minutes' => $service->duration_minutes,
            'slots' => $slots,
        ]);
    }

    /**
     * Create a booking from the public widget.
     */
    public function book(Request $request, Location $location): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'employee_id' => 'required|exists:users,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:1000',
        ]);

        $service = Service::findOrFail($validated['service_id']);
        $startsAt = Carbon::parse($validated['date'].' '.$validated['time']);
        $endsAt = $startsAt->copy()->addMinutes($service->duration_minutes);

        // Check for double booking
        $conflict = Appointment::where('user_id', $validated['employee_id'])
            ->whereDate('starts_at', $validated['date'])
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->where(function ($q) use ($startsAt, $endsAt) {
                $q->where('starts_at', '<', $endsAt)
                    ->where('ends_at', '>', $startsAt);
            })
            ->exists();

        if ($conflict) {
            abort(422, 'This time slot is no longer available.');
        }

        // Find or create client
        $client = $location->clients()->firstOrCreate(
            ['email' => $validated['email']],
            [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'phone' => $validated['phone'] ?? null,
                'locale' => app()->getLocale(),
            ]
        );

        $appointment = $location->appointments()->create([
            'client_id' => $client->id,
            'user_id' => $validated['employee_id'],
            'service_id' => $validated['service_id'],
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => Appointment::STATUS_SCHEDULED,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Booking confirmed.',
            'appointment' => new AppointmentResource($appointment->load(['client', 'employee', 'service'])),
        ], 201);
    }
}
