<?php

namespace App\Http\Requests\Wholesale;

use Illuminate\Foundation\Http\FormRequest;

class ApplyWholesaleRequest extends FormRequest
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
            'company' => ['required', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'item_type' => ['required', 'string', 'max:255'],
            'volume' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'company.required' => "Le nom de l'entreprise est obligatoire.",
            'company.max' => "Le nom de l'entreprise ne doit pas dépasser 255 caractères.",
            'city.max' => 'La ville ne doit pas dépasser 255 caractères.',
            'item_type.required' => "Le type d'articles est obligatoire.",
            'volume.required' => 'Le volume estimé est obligatoire.',
        ];
    }
}
