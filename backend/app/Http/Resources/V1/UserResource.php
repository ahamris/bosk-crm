<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'type' => $this->type,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')),
            'employee_profile' => new EmployeeProfileResource($this->whenLoaded('employeeProfile')),
            'reviews_count' => $this->when(isset($this->reviews_count), $this->reviews_count),
            'reviews_avg_rating' => $this->when(isset($this->reviews_avg_rating), fn () => round((float) $this->reviews_avg_rating, 1)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
