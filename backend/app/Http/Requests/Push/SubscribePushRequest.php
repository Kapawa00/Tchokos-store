<?php

namespace App\Http\Requests\Push;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Reprend la forme exacte de PushSubscription.toJSON() côté navigateur :
 * { endpoint, keys: { p256dh, auth } }.
 */
class SubscribePushRequest extends FormRequest
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
            'endpoint' => ['required', 'string', 'max:500', 'url'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'endpoint.required' => "L'endpoint de l'abonnement est obligatoire.",
            'endpoint.url' => "L'endpoint de l'abonnement n'est pas une URL valide.",
            'keys.p256dh.required' => 'La clé p256dh est obligatoire.',
            'keys.auth.required' => 'La clé auth est obligatoire.',
        ];
    }
}
