<?php

namespace App\Http\Requests\Push;

use Illuminate\Foundation\Http\FormRequest;

class UnsubscribePushRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'endpoint' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'endpoint.required' => "L'endpoint de l'abonnement est obligatoire.",
        ];
    }
}
