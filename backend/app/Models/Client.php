<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Client extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'location_id',
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'postal_code',
        'country',
        'company_name',
        'preferred_contact',
        'delivery_method',
        'source',
        'date_of_birth',
        'gender',
        'notes',
        'medical_notes',
        'skin_type',
        'marketing_consent',
        'locale',
        'is_active',
        'tax_number',
        'chamber_of_commerce',
        'bank_account',
        'moneybird_contact_id',
        'moneybird_customer_id',
        'telegram_chat_id',
        'no_show_count',
        'late_cancel_count',
        'requires_deposit',
        'requires_prepayment',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'is_active' => 'boolean',
            'marketing_consent' => 'boolean',
            'requires_deposit' => 'boolean',
            'requires_prepayment' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function clientNotes(): HasMany
    {
        return $this->hasMany(ClientNote::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function communicationLogs(): HasMany
    {
        return $this->hasMany(CommunicationLog::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty();
    }
}
