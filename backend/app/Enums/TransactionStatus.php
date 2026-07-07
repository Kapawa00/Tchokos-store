<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Failed = 'failed';
}
