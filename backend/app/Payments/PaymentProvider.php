<?php

namespace App\Payments;

use App\Models\Order;
use App\Payments\DataObjects\PaymentCallbackResult;
use App\Payments\DataObjects\PaymentInitiationResult;
use Illuminate\Http\Request;

/**
 * Abstraction commune à tous les moyens de paiement mobile (Orange Money,
 * MTN MoMo...). Chaque implémentation sait initier un paiement et
 * interpréter le callback (webhook) envoyé par l'opérateur/agrégateur.
 */
interface PaymentProvider
{
    /**
     * Démarre un paiement pour la commande donnée et renvoie la référence de
     * paiement (et éventuellement une URL de redirection) à présenter au
     * client.
     */
    public function initiate(Order $order): PaymentInitiationResult;

    /**
     * Vérifie l'authenticité du webhook (signature) avant tout traitement.
     * Toute confirmation de paiement DOIT passer par cette vérification :
     * jamais de confirmation basée sur une donnée envoyée par le client.
     */
    public function verifySignature(Request $request): bool;

    /**
     * Interprète le contenu (déjà vérifié) du callback et indique si le
     * paiement est confirmé, échoué, ou encore en attente.
     */
    public function handleCallback(array $payload): PaymentCallbackResult;
}
