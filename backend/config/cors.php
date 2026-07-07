<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Le frontend Next.js est une application séparée (autre origine), donc
    | l'API doit explicitement autoriser son URL. FRONTEND_URL est défini
    | dans .env (http://localhost:3000 en dev).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Auth par jeton Bearer (Sanctum API tokens) : pas de cookies cross-site nécessaires.
    'supports_credentials' => false,

];
