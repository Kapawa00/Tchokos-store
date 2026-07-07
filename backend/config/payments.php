<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Orange Money / MTN MoMo
    |--------------------------------------------------------------------------
    |
    | Tant que les identifiants réels ne sont pas fournis, les providers
    | correspondants (App\Payments\Providers\OrangeMoneyProvider,
    | MtnMomoProvider) basculent automatiquement sur un comportement
    | "sandbox" simulé (cf. SandboxPaymentProvider) pour permettre de tester
    | le flux complet initiate → webhook → commande payée.
    |
    | Orange Money Web Payment API : authentification par merchant_key +
    | identifiants OAuth (api_username/api_password en Basic Auth pour
    | obtenir un jeton). MTN MoMo (Collections API) : api_user + api_key
    | (Basic Auth pour le jeton) + clé d'abonnement (Ocp-Apim-Subscription-Key).
    | À ajuster une fois la documentation exacte de l'agrégateur fournie.
    |
    */

    'orange_money' => [
        'merchant_key' => env('ORANGE_MONEY_MERCHANT_KEY'),
        'api_username' => env('ORANGE_MONEY_API_USERNAME'),
        'api_password' => env('ORANGE_MONEY_API_PASSWORD'),
    ],

    'momo' => [
        'api_user' => env('MTN_MOMO_API_USER'),
        'api_key' => env('MTN_MOMO_API_KEY'),
        'subscription_key' => env('MTN_MOMO_SUBSCRIPTION_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Signature des webhooks
    |--------------------------------------------------------------------------
    |
    | Secret HMAC partagé utilisé pour vérifier l'authenticité des callbacks
    | de paiement (en-tête X-Signature = HMAC-SHA256 du corps brut). À
    | remplacer par le mécanisme propre à l'agrégateur une fois sa
    | documentation fournie (certains signent différemment).
    |
    */

    'webhook_secret' => env('PAYMENT_AGGREGATOR_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Sandbox
    |--------------------------------------------------------------------------
    |
    | Secret de repli utilisé par le mode sandbox simulé (et par Orange
    | Money / MoMo tant qu'ils n'ont pas de clés réelles). Valeur de
    | développement uniquement.
    |
    */

    'sandbox' => [
        'webhook_secret' => env('SANDBOX_PAYMENT_WEBHOOK_SECRET', 'sandbox-webhook-secret-dev'),
    ],

];
