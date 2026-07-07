<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Enums\WholesaleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Models\WholesaleAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = $data['role'] ?? UserRole::Customer->value;

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role' => $role,
        ]);

        if ($role === UserRole::Wholesaler->value) {
            WholesaleAccount::create([
                'user_id' => $user->id,
                'status' => WholesaleStatus::Pending,
                'company' => $data['company'],
                'city' => $data['city'] ?? null,
            ]);
        }

        // Vérification automatique au moment de l'inscription : aucun lien par
        // e-mail n'est envoyé, le compte est immédiatement actif.
        $user->markEmailAsVerified();

        $token = $user->createToken($data['device_name'] ?? 'api-token')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé avec succès.',
            'user' => $user->load('wholesaleAccount'),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $token = $user->createToken($data['device_name'] ?? 'api-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'user' => $user->load('wholesaleAccount'),
            'token' => $token,
            // Un seul écran de connexion côté vitrine : pour le staff, ce lien
            // signé (60s) ouvre directement la session Filament (cf.
            // AdminSsoController), sans lui redemander son mot de passe.
            'admin_redirect_url' => in_array($user->role, [UserRole::Admin, UserRole::Manager], true)
                ? URL::temporarySignedRoute('admin.sso', now()->addSeconds(60), ['user' => $user->id])
                : null,
        ]);
    }

    /**
     * Lien signé (60s) vers la session Filament, réémis à la demande pour un
     * admin/manager déjà authentifié côté Sanctum (cf. commentaire de la
     * route dans routes/api.php).
     */
    public function adminSsoLink(Request $request): JsonResponse
    {
        return response()->json([
            'url' => URL::temporarySignedRoute('admin.sso', now()->addSeconds(60), ['user' => $request->user()->id]),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('wholesaleAccount');

        return response()->json([
            'user' => $user,
            'can_view_wholesale_price' => Auth::user()->can('viewWholesalePrice'),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'             => ['sometimes', 'string', 'min:2', 'max:100'],
            'phone'            => ['sometimes', 'nullable', 'string', 'max:20'],
            'current_password' => ['required_with:password', 'current_password'],
            'password'         => ['sometimes', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (isset($data['name']))     $user->name  = $data['name'];
        if (array_key_exists('phone', $data)) $user->phone = $data['phone'];
        if (isset($data['password'])) $user->password = Hash::make($data['password']);

        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user'    => $user->load('wholesaleAccount'),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => ['required'],
            'email'                 => ['required', 'email'],
            'password'              => ['required', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
                // Révoquer tous les jetons Sanctum existants pour forcer une nouvelle connexion.
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
