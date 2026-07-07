<?php

use App\Http\Controllers\Auth\AdminSsoController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Pont de connexion unique storefront → Filament (cf. AuthController::login()).
Route::get('/admin/sso/{user}', AdminSsoController::class)
    ->middleware('signed')
    ->name('admin.sso');
