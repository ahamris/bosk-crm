<?php

namespace App\Http\Requests\V1;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => ['sometimes', 'exists:clients,id'],
            'user_id' => ['sometimes', 'exists:users,id'],
            'service_id' => ['sometimes', 'exists:services,id'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after:starts_at'],
            'status' => ['sometimes', 'string', Rule::in(Appointment::STATUSES)],
            'notes' => ['nullable', 'string'],
            'cancellation_reason' => ['nullable', 'string', 'required_if:status,cancelled'],
        ];
    }
}
