<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case OrangeMoney = 'orange_money';
    case Momo = 'momo';
    case Whatsapp = 'whatsapp';

    public function label(): string
    {
        return match ($this) {
            self::OrangeMoney => 'Orange Money',
            self::Momo => 'MTN Mobile Money',
            self::Whatsapp => 'WhatsApp (paiement assisté)',
        };
    }
}
