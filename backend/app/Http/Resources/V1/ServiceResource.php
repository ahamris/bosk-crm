<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'location_id' => $this->location_id,
            'category' => new ServiceCategoryResource($this->whenLoaded('category')),
            'name_nl' => $this->name_nl,
            'name_en' => $this->name_en,
            'name_ru' => $this->name_ru,
            'description_nl' => $this->description_nl,
            'description_en' => $this->description_en,
            'description_ru' => $this->description_ru,
            'duration_minutes' => $this->duration_minutes,
            'buffer_minutes' => $this->buffer_minutes,
            'price_cents' => $this->price_cents,
            'price' => $this->price,
            'color' => $this->color,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
