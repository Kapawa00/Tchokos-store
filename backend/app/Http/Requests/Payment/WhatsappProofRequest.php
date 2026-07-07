<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class WhatsappProofRequest extends FormRequest
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
            'proof_url' => ['required', 'url', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'proof_url.required' => 'Le lien vers la preuve de paiement est obligatoire.',
            'proof_url.url' => "Le lien fourni n'est pas une URL valide.",
        ];
    }
}
