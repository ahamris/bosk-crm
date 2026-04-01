<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'location_id' => $this->location_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'company_name' => $this->company_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'tax_number' => $this->tax_number,
            'chamber_of_commerce' => $this->chamber_of_commerce,
            'bank_account' => $this->bank_account,
            'delivery_method' => $this->delivery_method,
            'preferred_contact' => $this->preferred_contact,
            'source' => $this->source,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender,
            'notes' => $this->notes,
            'medical_notes' => $this->medical_notes,
            'skin_type' => $this->skin_type,
            'marketing_consent' => $this->marketing_consent,
            'locale' => $this->locale,
            'is_active' => $this->is_active,
            'moneybird_contact_id' => $this->moneybird_contact_id,
            'moneybird_customer_id' => $this->moneybird_customer_id,
            'appointments_count' => $this->whenCounted('appointments'),
            'client_notes' => ClientNoteResource::collection($this->whenLoaded('clientNotes')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
