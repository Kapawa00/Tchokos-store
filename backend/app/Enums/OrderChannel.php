<?php

namespace App\Enums;

enum OrderChannel: string
{
    case Whatsapp = 'whatsapp';
    case Email = 'email';
    case Site = 'site';
}
