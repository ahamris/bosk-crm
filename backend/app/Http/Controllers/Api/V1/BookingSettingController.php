<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookingSetting;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingSettingController extends Controller
{
    /**
     * Get booking settings for a location.
     */
    public function show(Location $location): JsonResponse
    {
        $settings = $location->bookingSetting;

        if (! $settings) {
            return response()->json([
                'data' => null,
                'message' => 'No booking settings configured for this location.',
            ]);
        }

        return response()->json(['data' => $settings]);
    }

    /**
     * Create or update booking settings for a location.
     */
    public function update(Request $request, Location $location): JsonResponse
    {
        $validated = $request->validate([
            'cancellation_window_hours' => 'sometimes|integer|min:0|max:168',
            'late_cancel_charge_percent' => 'sometimes|integer|min:0|max:100',
            'no_show_charge_percent' => 'sometimes|integer|min:0|max:100',
            'max_pay_at_venue_bookings' => 'sometimes|integer|min:0|max:99',
            'require_deposit' => 'sometimes|boolean',
            'deposit_percent' => 'sometimes|integer|min:0|max:100',
            'min_booking_notice_hours' => 'sometimes|integer|min:0|max:168',
            'max_booking_advance_days' => 'sometimes|integer|min:1|max:365',
            'auto_confirm' => 'sometimes|boolean',
            'cancellation_policy_nl' => 'nullable|string|max:5000',
            'cancellation_policy_en' => 'nullable|string|max:5000',
            'cancellation_policy_ru' => 'nullable|string|max:5000',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string|max:100',
            'social_links' => 'nullable|array',
            'social_links.*' => 'string|max:500',
            'about_nl' => 'nullable|string|max:10000',
            'about_en' => 'nullable|string|max:10000',
            'about_ru' => 'nullable|string|max:10000',
        ]);

        $settings = BookingSetting::updateOrCreate(
            ['location_id' => $location->id],
            $validated,
        );

        return response()->json(['data' => $settings]);
    }
}
