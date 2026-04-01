<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Integration extends Model
{
    protected $fillable = [
        'provider',
        'name',
        'is_active',
        'settings',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'metadata' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get a specific setting value by key.
     */
    public function getSetting(string $key, mixed $default = null): mixed
    {
        return data_get($this->settings, $key, $default);
    }

    /**
     * Find integration by provider name.
     */
    public static function forProvider(string $provider): ?self
    {
        return static::where('provider', $provider)->first();
    }
}
