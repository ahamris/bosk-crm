<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * List reviews for a location, with client + employee, ordered by newest.
     */
    public function index(Location $location): JsonResponse
    {
        $reviews = $location->reviews()
            ->with(['client', 'employee'])
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($reviews);
    }

    /**
     * Create a new review for a location.
     */
    public function store(Request $request, Location $location): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'employee_user_id' => ['required', 'exists:users,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string'],
        ]);

        $review = $location->reviews()->create($validated);

        return response()->json($review->load(['client', 'employee']), 201);
    }

    /**
     * Show a single review.
     */
    public function show(Location $location, Review $review): JsonResponse
    {
        return response()->json(
            $review->load(['client', 'employee', 'appointment'])
        );
    }

    /**
     * Toggle the is_published flag on a review.
     */
    public function togglePublish(Location $location, Review $review): JsonResponse
    {
        $review->update(['is_published' => !$review->is_published]);

        return response()->json($review);
    }

    /**
     * Delete a review.
     */
    public function destroy(Location $location, Review $review): JsonResponse
    {
        $review->delete();

        return response()->json(null, 204);
    }

    /**
     * Public endpoint: published reviews for an employee at a location.
     */
    public function employeeReviews(Location $location, int $userId): JsonResponse
    {
        $reviews = Review::where('location_id', $location->id)
            ->where('employee_user_id', $userId)
            ->where('is_published', true)
            ->with('client:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($reviews);
    }
}
