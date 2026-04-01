<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'phone' => $this->phone,
            'email' => $this->email,
            'timezone' => $this->timezone,
            'is_active' => $this->is_active,
            'services_count' => $this->whenCounted('services'),
            'clients_count' => $this->whenCounted('clients'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
