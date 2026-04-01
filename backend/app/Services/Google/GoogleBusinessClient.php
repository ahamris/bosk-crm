<?php

namespace App\Services\Google;

use App\Models\Integration;
use Illuminate\Support\Facades\Http;

class GoogleBusinessClient
{
    private ?string $accessToken;
    private ?string $locationId; // Google location resource name
    private string $baseUrl = 'https://mybusiness.googleapis.com/v4';

    public function __construct()
    {
        $integration = Integration::forProvider('google_business');
        $this->accessToken = $integration?->settings['access_token'] ?? null;
        $this->locationId = $integration?->settings['location_resource_name'] ?? null;
    }

    public function isConfigured(): bool
    {
        return $this->accessToken && $this->locationId;
    }

    private function http()
    {
        return Http::withToken($this->accessToken)->acceptJson()->asJson();
    }

    // Update business info (name, address, phone, website, hours)
    public function updateLocation(array $data): array
    {
        return $this->http()->patch("{$this->baseUrl}/{$this->locationId}", $data)->json();
    }

    // Update opening hours
    public function updateHours(array $periods): array
    {
        return $this->http()->patch("{$this->baseUrl}/{$this->locationId}", [
            'regularHours' => ['periods' => $periods],
        ])->json();
    }

    // Get reviews from Google
    public function getReviews(): array
    {
        return $this->http()->get("{$this->baseUrl}/{$this->locationId}/reviews")->json();
    }

    // Reply to a review
    public function replyToReview(string $reviewName, string $comment): array
    {
        return $this->http()->put("{$this->baseUrl}/{$reviewName}/reply", [
            'comment' => $comment,
        ])->json();
    }

    // Create a post (for promotions/updates)
    public function createPost(array $data): array
    {
        return $this->http()->post("{$this->baseUrl}/{$this->locationId}/localPosts", $data)->json();
    }

    // Test connection
    public function testConnection(): bool
    {
        try {
            $response = $this->http()->get("{$this->baseUrl}/{$this->locationId}");
            return $response->successful();
        } catch (\Exception) {
            return false;
        }
    }
}
