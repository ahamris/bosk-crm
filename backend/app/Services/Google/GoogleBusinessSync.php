<?php

namespace App\Services\Google;

use App\Models\Location;
use App\Models\Review;
use App\Models\WorkingHour;

class GoogleBusinessSync
{
    public function __construct(private GoogleBusinessClient $client) {}

    // Sync location info to Google
    public function syncLocation(Location $location): void
    {
        if (!$this->client->isConfigured()) return;

        $this->client->updateLocation([
            'locationName' => $location->name,
            'address' => [
                'addressLines' => [$location->address],
                'locality' => $location->city,
                'postalCode' => '',
                'regionCode' => 'NL',
            ],
            'primaryPhone' => $location->phone,
            'websiteUrl' => url("/salon/{$location->id}"),
        ]);
    }

    // Sync working hours to Google
    public function syncHours(Location $location): void
    {
        if (!$this->client->isConfigured()) return;

        $dayMap = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        $periods = [];

        // Get all unique working hours for this location
        $hours = WorkingHour::where('location_id', $location->id)
            ->where('is_available', true)
            ->orderBy('day_of_week')
            ->get()
            ->groupBy('day_of_week');

        foreach ($hours as $day => $dayHours) {
            $first = $dayHours->first();
            $periods[] = [
                'openDay' => $dayMap[$day] ?? 'MONDAY',
                'openTime' => $first->start_time,
                'closeDay' => $dayMap[$day] ?? 'MONDAY',
                'closeTime' => $first->end_time,
            ];
        }

        $this->client->updateHours($periods);
    }

    // Import reviews from Google into BOSK
    public function importReviews(Location $location): int
    {
        if (!$this->client->isConfigured()) return 0;

        $response = $this->client->getReviews();
        $googleReviews = $response['reviews'] ?? [];
        $imported = 0;

        foreach ($googleReviews as $gr) {
            $rating = match($gr['starRating'] ?? '') {
                'ONE' => 1, 'TWO' => 2, 'THREE' => 3, 'FOUR' => 4, 'FIVE' => 5, default => 0,
            };
            if ($rating === 0) continue;

            // Check if already imported (by google review name)
            $exists = Review::where('location_id', $location->id)
                ->where('comment', 'LIKE', '%[Google]%')
                ->where('created_at', '>=', now()->subDays(1))
                ->exists();

            if (!$exists) {
                Review::create([
                    'location_id' => $location->id,
                    'client_id' => 1, // system client
                    'employee_user_id' => 1, // system user
                    'rating' => $rating,
                    'comment' => ($gr['comment'] ?? '') . ' [Google]',
                    'is_published' => true,
                ]);
                $imported++;
            }
        }

        return $imported;
    }
}
