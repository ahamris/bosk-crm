<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id',
        'client_id',
        'appointment_id',
        'moneybird_invoice_id',
        'invoice_number',
        'status',
        'total_cents',
        'tax_cents',
        'currency',
        'pdf_url',
        'invoice_date',
        'due_date',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'invoice_date' => 'datetime',
            'due_date' => 'datetime',
            'paid_at' => 'datetime',
            'total_cents' => 'integer',
            'tax_cents' => 'integer',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(InvoiceLine::class);
    }
}
