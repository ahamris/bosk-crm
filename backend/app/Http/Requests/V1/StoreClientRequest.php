<?php

namespace App\Http\Requests\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'country' => ['sometimes', 'string', 'size:2'],
            'preferred_contact' => ['sometimes', 'string', Rule::in(['email', 'phone', 'sms', 'whatsapp'])],
            'source' => ['nullable', 'string', Rule::in(['walk_in', 'website', 'referral', 'social_media'])],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', Rule::in(['male', 'female', 'other'])],
            'notes' => ['nullable', 'string'],
            'medical_notes' => ['nullable', 'string'],
            'skin_type' => ['nullable', 'string', Rule::in(['normal', 'dry', 'oily', 'combination', 'sensitive'])],
            'marketing_consent' => ['sometimes', 'boolean'],
            'locale' => ['sometimes', 'string', Rule::in(['nl', 'en', 'ru'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
