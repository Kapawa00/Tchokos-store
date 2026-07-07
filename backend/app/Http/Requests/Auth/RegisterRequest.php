<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
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
            'name'     => ['required', 'string', 'max:255'],
            // email:rfc valide le format RFC 5321/5322.
            // email:dns vérifie que le domaine possède un enregistrement MX ou A
            // (le domaine est capable de recevoir des e-mails).
            'email'    => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role'     => ['nullable', Rule::in(['customer', 'wholesaler'])],
            'company'  => ['required_if:role,wholesaler', 'nullable', 'string', 'max:255'],
            'city'     => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'         => 'Le nom est obligatoire.',
            'name.max'              => 'Le nom ne doit pas dépasser 255 caractères.',
            'email.required'        => "L'adresse e-mail est obligatoire.",
            'email.email'           => "L'adresse e-mail n'est pas valide ou son domaine n'existe pas. Vérifiez le format (ex : nom@gmail.com) et que l'adresse est réelle.",
            'email.unique'          => 'Cette adresse e-mail est déjà utilisée par un autre compte.',
            'phone.max'             => 'Le numéro de téléphone ne doit pas dépasser 20 caractères.',
            'password.required'     => 'Le mot de passe est obligatoire.',
            'password.min'          => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed'    => 'La confirmation du mot de passe ne correspond pas.',
            'role.in'               => 'Le rôle choisi est invalide.',
            'company.required_if'   => "Le nom de l'entreprise est obligatoire pour un compte grossiste.",
        ];
    }
}
