<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\AppointmentResource;
use App\Http\Resources\V1\ClientResource;
use App\Models\Client;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientPortalController extends Controller
{
    // Get client profile (linked to authenticated user)
    public function profile(Request $request): JsonResponse
    {
        $client = Client::where('user_id', $request->user()->id)->first();
        if (!$client) {
            return response()->json(['message' => 'No client profile linked.'], 404);
        }
        return response()->json(new ClientResource($client->loadCount('appointments')));
    }

    // Get own appointments
    public function appointments(Request $request): JsonResponse
    {
        $client = Client::where('user_id', $request->user()->id)->first();
        if (!$client) return response()->json(['data' => []]);

        $appointments = $client->appointments()
            ->with(['service', 'employee', 'location'])
            ->orderByDesc('starts_at')
            ->paginate(20);

        return response()->json(AppointmentResource::collection($appointments));
    }

    // Get upcoming appointments
    public function upcoming(Request $request): JsonResponse
    {
        $client = Client::where('user_id', $request->user()->id)->first();
        if (!$client) return response()->json(['data' => []]);

        $appointments = $client->appointments()
            ->with(['service', 'employee', 'location'])
            ->where('starts_at', '>=', now())
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->orderBy('starts_at')
            ->limit(5)
            ->get();

        return response()->json(AppointmentResource::collection($appointments));
    }

    // Submit a review
    public function submitReview(Request $request): JsonResponse
    {
        $client = Client::where('user_id', $request->user()->id)->first();
        if (!$client) return response()->json(['message' => 'No client profile.'], 404);

        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $appointment = $client->appointments()->findOrFail($validated['appointment_id']);

        // Check if review already exists
        if (Review::where('appointment_id', $appointment->id)->where('client_id', $client->id)->exists()) {
            return response()->json(['message' => 'Review already submitted.'], 409);
        }

        $review = Review::create([
            'location_id' => $appointment->location_id,
            'client_id' => $client->id,
            'appointment_id' => $appointment->id,
            'employee_user_id' => $appointment->user_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'is_published' => false, // Admin must approve
        ]);

        return response()->json($review, 201);
    }

    // Update own profile
    public function updateProfile(Request $request): JsonResponse
    {
        $client = Client::where('user_id', $request->user()->id)->first();
        if (!$client) return response()->json(['message' => 'No client profile.'], 404);

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'date_of_birth' => 'nullable|date',
            'locale' => 'nullable|in:nl,en,ru',
        ]);

        $client->update($validated);
        return response()->json(new ClientResource($client));
    }

    // Cancel an upcoming appointment
    public function cancelAppointment(Request $request, int $appointmentId): JsonResponse
    {
        $client = Client::where('user_id', $request->user()->id)->first();
        if (!$client) return response()->json(['message' => 'No client profile.'], 404);

        $appointment = $client->appointments()->findOrFail($appointmentId);

        if (!in_array($appointment->status, ['scheduled', 'confirmed'])) {
            return response()->json(['message' => 'Cannot cancel this appointment.'], 422);
        }

        // Check cancellation window
        $settings = $appointment->location->bookingSetting;
        $windowHours = $settings?->cancellation_window_hours ?? 24;
        $isFreeCancel = now()->lt($appointment->starts_at->subHours($windowHours));

        $appointment->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $isFreeCancel ? 'Client cancelled (free)' : 'Client cancelled (late)',
        ]);

        if (!$isFreeCancel) {
            $client->increment('late_cancel_count');
        }

        return response()->json([
            'message' => $isFreeCancel ? 'Appointment cancelled (free).' : 'Late cancellation — charges may apply.',
            'free_cancel' => $isFreeCancel,
        ]);
    }
}
