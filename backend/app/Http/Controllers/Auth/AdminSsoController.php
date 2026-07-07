<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminSsoController extends Controller
{
    /**
     * Pont entre la connexion Sanctum (front-office, jeton Bearer) et la
     * session Filament (guard "web") : /login renvoie ce lien signé et à
     * courte durée de vie pour un admin/manager, la navigation dessus ouvre
     * directement sa session /admin sans lui redemander son mot de passe.
     *
     * ⚠️ Route protégée par le middleware `signed` (lien à usage unique de
     *     fait, valable 60 secondes — cf. AuthController::login()).
     */
    public function __invoke(Request $request, User $user): RedirectResponse
    {
        if (! in_array($user->role, [UserRole::Admin, UserRole::Manager], true)) {
            abort(403);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return redirect('/admin');
    }
}
