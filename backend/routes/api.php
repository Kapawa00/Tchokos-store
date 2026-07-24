<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Catalog\BannerController;
use App\Http\Controllers\Catalog\CategoryController;
use App\Http\Controllers\Catalog\ProductController;
use App\Http\Controllers\Catalog\ReelController;
use App\Http\Controllers\Catalog\SearchController;
use App\Http\Controllers\Payments\PaymentController;
use App\Http\Controllers\Push\PushController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\OrderController;
use App\Http\Controllers\Wholesale\WholesaleController;
use Illuminate\Support\Facades\Route;

// Route de test : vérifie que l'API répond (utilisée par le frontend / monitoring).
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Catalogue, panier et création de commande : authentification optionnelle.
// Si un jeton Sanctum est fourni, le prix de gros s'affiche pour un
// grossiste approuvé, et le panier/la commande se rattachent à son compte.
// Un invité passe par un session_token (en-tête X-Session-Token ou champ
// session_token) à la place.
Route::middleware('auth.optional')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/reels', [ReelController::class, 'index']);
    Route::get('/reels/hero', [ReelController::class, 'hero']);
    Route::get('/banners', [BannerController::class, 'index']);
    Route::get('/search', [SearchController::class, 'index']);

    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::patch('/cart/items/{item}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{item}', [CartController::class, 'removeItem']);
    Route::delete('/cart', [CartController::class, 'clear']);

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{reference}', [OrderController::class, 'show']);

    Route::post('/push/subscribe', [PushController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [PushController::class, 'unsubscribe']);

    Route::post('/payments/{reference}/initiate', [PaymentController::class, 'initiate']);
    Route::post('/payments/{reference}/whatsapp-proof', [PaymentController::class, 'whatsappProof']);
});

// Webhook public : appelé par l'agrégateur/opérateur, jamais par le client.
// Authentifié par signature (cf. PaymentProvider::verifySignature()), pas par Sanctum.
Route::post('/payments/webhook/{provider}', [PaymentController::class, 'webhook']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);

    // Vérification d'e-mail.
    // La route `verify` utilise le middleware `signed` pour valider le HMAC du lien.
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('signed')
        ->name('verification.verify');
    Route::post('/email/resend-verification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:3,1'); // max 3 renvois par minute
    Route::get('/orders', [OrderController::class, 'index']);

    Route::post('/wholesale/apply', [WholesaleController::class, 'apply']);
    Route::get('/wholesale/status', [WholesaleController::class, 'status']);

    // Routes réservées au back-office (admin/manager).
    Route::middleware('role:admin,manager')->prefix('admin')->group(function () {
        Route::get('/ping', function () {
            return response()->json(['message' => 'Accès admin/manager confirmé.']);
        });

        // Lien signé (60s) vers la session Filament, réémis à la demande —
        // ex. quand l'espace /compte (protégé) redirige un admin/manager déjà
        // authentifié côté Sanctum mais sans session Filament active
        // (les deux guards sont indépendants, cf. AdminSsoController).
        Route::get('/sso-link', [AuthController::class, 'adminSsoLink']);

        Route::patch('/orders/{reference}/status', [OrderController::class, 'updateStatus']);
    });
});
