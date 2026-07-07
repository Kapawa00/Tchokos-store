<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Manager = 'manager';
    case Customer = 'customer';
    case Wholesaler = 'wholesaler';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrateur',
            self::Manager => 'Gestionnaire',
            self::Customer => 'Client',
            self::Wholesaler => 'Grossiste',
        };
    }
}
