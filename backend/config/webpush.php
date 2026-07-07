<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Clés VAPID (Web Push, sans Firebase)
    |--------------------------------------------------------------------------
    |
    | Générez-les avec : php artisan webpush:vapid-keys
    | La clé publique est sans risque à exposer au frontend (elle sert au
    | navigateur pour créer l'abonnement PushManager). La clé privée ne doit
    | jamais quitter le serveur.
    |
    */

    'vapid' => [
        'subject' => env('VAPID_SUBJECT', 'mailto:admin@tchokos.test'),
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
    ],

];
