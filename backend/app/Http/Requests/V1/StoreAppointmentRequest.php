<?php

namespace App\Http\Requests\V1;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $locationId = $this->route('location')?->id ?? $this->route('location');

        return [
            'client_id' => ['required', Rule::exists('clients', 'id')->where('location_id', $locationId)],
            'user_id' => ['required', 'exists:users,id'],
            'service_id' => ['required', Rule::exists('services', 'id')->where('location_id', $locationId)],
            'starts_at' => ['required', 'date', 'after:now'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'status' => ['sometimes', 'string', Rule::in(Appointment::STATUSES)],
            'notes' => ['nullable', 'string'],
        ];
    }
}
