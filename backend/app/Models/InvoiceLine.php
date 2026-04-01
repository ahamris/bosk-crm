<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceLine extends Model
{
    protected $fillable = [
        'invoice_id',
        'service_id',
        'description',
        'quantity',
        'price_cents',
        'tax_rate',
        'total_cents',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price_cents' => 'integer',
            'tax_rate' => 'decimal:2',
            'total_cents' => 'integer',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
