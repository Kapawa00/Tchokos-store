<?php

namespace App\Http\Requests\Order;

use App\Enums\OrderChannel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
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
        // Un utilisateur connecté peut laisser ses coordonnées de profil
        // faire foi ; un invité doit les renseigner explicitement.
        $hasUser = (bool) $this->user('sanctum');

        return [
            'channel' => ['required', Rule::in(array_column(OrderChannel::cases(), 'value'))],
            'customer_name' => [$hasUser ? 'nullable' : 'required', 'string', 'max:255'],
            'customer_phone' => [$hasUser ? 'nullable' : 'required', 'string', 'max:20'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'channel.required' => 'Le canal de commande est obligatoire.',
            'channel.in' => 'Le canal choisi est invalide.',
            'customer_name.required' => 'Le nom du client est obligatoire.',
            'customer_phone.required' => 'Le numéro de téléphone est obligatoire.',
            'customer_email.email' => "L'adresse e-mail n'est pas valide.",
            'notes.max' => 'La note ne doit pas dépasser 1000 caractères.',
        ];
    }
}
