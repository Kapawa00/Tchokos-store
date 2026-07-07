<?php

namespace App\Observers;

use App\Enums\UserRole;
use App\Enums\WholesaleStatus;
use App\Models\WholesaleAccount;

/**
 * Synchronise le rôle de l'utilisateur avec le statut de son compte
 * grossiste, quel que soit le canal par lequel ce statut change (API,
 * Filament, Tinker...) : approuvé => rôle wholesaler ; retiré (remis en
 * attente ou rejeté après avoir été approuvé) => retour au rôle customer.
 */
class WholesaleAccountObserver
{
    public function created(WholesaleAccount $account): void
    {
        $this->syncRole($account);
    }

    public function updated(WholesaleAccount $account): void
    {
        if ($account->wasChanged('status')) {
            $this->syncRole($account);
        }
    }

    private function syncRole(WholesaleAccount $account): void
    {
        $user = $account->user;

        if (! $user) {
            return;
        }

        if ($account->status === WholesaleStatus::Approved && $user->role !== UserRole::Wholesaler) {
            $user->update(['role' => UserRole::Wholesaler]);
        } elseif ($account->status !== WholesaleStatus::Approved && $user->role === UserRole::Wholesaler) {
            $user->update(['role' => UserRole::Customer]);
        }
    }
}
