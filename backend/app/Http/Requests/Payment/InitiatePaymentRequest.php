<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InitiatePaymentRequest extends FormRequest
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
            // Le canal WhatsApp passe par /payments/{order}/whatsapp-proof, pas par initiate().
            'method' => ['required', Rule::in(['orange_money', 'momo'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'method.required' => 'Le moyen de paiement est obligatoire.',
            'method.in' => 'Le moyen de paiement doit être "orange_money" ou "momo".',
        ];
    }
}
