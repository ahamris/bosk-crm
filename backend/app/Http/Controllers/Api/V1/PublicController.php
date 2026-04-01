<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ServiceResource;
use App\Models\Location;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class PublicController extends Controller
{
    /**
     * Landing page data — location info, featured services, team, reviews.
     */
    public function landing(Location $location): JsonResponse
    {
        $location->load('bookingSetting');

        $services = $location->services()
            ->with('category')
            ->where('is_active', true)
            ->orderBy('service_category_id')
            ->get();

        $categories = $location->services()
            ->with('category')
            ->where('is_active', true)
            ->get()
            ->pluck('category')
            ->unique('id')
            ->values();

        $employees = User::whereHas('employeeProfiles', fn ($q) => $q->where('location_id', $location->id)->where('is_active', true))
            ->with(['employeeProfile' => fn ($q) => $q->where('location_id', $location->id)])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->get();

        $reviews = Review::where('location_id', $location->id)
            ->where('is_published', true)
            ->with(['client', 'employee'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $reviewStats = [
            'average' => round(Review::where('location_id', $location->id)->where('is_published', true)->avg('rating'), 1),
            'count' => Review::where('location_id', $location->id)->where('is_published', true)->count(),
            'distribution' => [
                5 => Review::where('location_id', $location->id)->where('is_published', true)->where('rating', 5)->count(),
                4 => Review::where('location_id', $location->id)->where('is_published', true)->where('rating', 4)->count(),
                3 => Review::where('location_id', $location->id)->where('is_published', true)->where('rating', 3)->count(),
                2 => Review::where('location_id', $location->id)->where('is_published', true)->where('rating', 2)->count(),
                1 => Review::where('location_id', $location->id)->where('is_published', true)->where('rating', 1)->count(),
            ],
        ];

        return response()->json([
            'location' => [
                'id' => $location->id,
                'name' => $location->name,
                'address' => $location->address,
                'city' => $location->city,
                'phone' => $location->phone,
                'email' => $location->email,
                'timezone' => $location->timezone,
                'about_nl' => $location->bookingSetting?->about_nl,
                'about_en' => $location->bookingSetting?->about_en,
                'about_ru' => $location->bookingSetting?->about_ru,
                'amenities' => $location->bookingSetting?->amenities ?? [],
                'social_links' => $location->bookingSetting?->social_links ?? [],
                'cancellation_policy_nl' => $location->bookingSetting?->cancellation_policy_nl,
                'cancellation_policy_en' => $location->bookingSetting?->cancellation_policy_en,
                'cancellation_policy_ru' => $location->bookingSetting?->cancellation_policy_ru,
                'cancellation_window_hours' => $location->bookingSetting?->cancellation_window_hours ?? 24,
            ],
            'services' => ServiceResource::collection($services),
            'categories' => $categories->map(fn ($c) => [
                'id' => $c->id,
                'name_nl' => $c->name_nl,
                'name_en' => $c->name_en,
                'name_ru' => $c->name_ru,
                'slug' => $c->slug,
                'services_count' => $services->where('service_category_id', $c->id)->count(),
            ]),
            'team' => $employees->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'type' => $e->type,
                'bio_nl' => $e->employeeProfile?->bio_nl,
                'bio_en' => $e->employeeProfile?->bio_en,
                'bio_ru' => $e->employeeProfile?->bio_ru,
                'specializations' => $e->employeeProfile?->specializations ?? [],
                'avatar_path' => $e->employeeProfile?->avatar_path,
                'reviews_count' => $e->reviews_count,
                'reviews_avg_rating' => $e->reviews_avg_rating ? round($e->reviews_avg_rating, 1) : null,
            ]),
            'reviews' => $reviews->map(fn ($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'client_name' => $r->client?->first_name.' '.mb_substr($r->client?->last_name ?? '', 0, 1).'.',
                'employee_name' => $r->employee?->name,
                'created_at' => $r->created_at->toISOString(),
            ]),
            'review_stats' => $reviewStats,
        ]);
    }

    /**
     * Get booking settings for a location (public — for displaying policies).
     */
    public function bookingSettings(Location $location): JsonResponse
    {
        $settings = $location->bookingSetting;

        return response()->json([
            'cancellation_window_hours' => $settings?->cancellation_window_hours ?? 24,
            'require_deposit' => $settings?->require_deposit ?? false,
            'deposit_percent' => $settings?->deposit_percent ?? 50,
            'auto_confirm' => $settings?->auto_confirm ?? true,
            'cancellation_policy_nl' => $settings?->cancellation_policy_nl,
            'cancellation_policy_en' => $settings?->cancellation_policy_en,
            'cancellation_policy_ru' => $settings?->cancellation_policy_ru,
            'amenities' => $settings?->amenities ?? [],
        ]);
    }
}
