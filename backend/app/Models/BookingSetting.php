<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingSetting extends Model
{
    protected $fillable = [
        'location_id',
        'cancellation_window_hours',
        'late_cancel_charge_percent',
        'no_show_charge_percent',
        'max_pay_at_venue_bookings',
        'require_deposit',
        'deposit_percent',
        'min_booking_notice_hours',
        'max_booking_advance_days',
        'auto_confirm',
        'cancellation_policy_nl',
        'cancellation_policy_en',
        'cancellation_policy_ru',
        'amenities',
        'social_links',
        'about_nl',
        'about_en',
        'about_ru',
    ];

    protected function casts(): array
    {
        return [
            'require_deposit' => 'boolean',
            'auto_confirm' => 'boolean',
            'amenities' => 'array',
            'social_links' => 'array',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
