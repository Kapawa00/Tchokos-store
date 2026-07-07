<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case Push = 'push';
    case Email = 'email';
}
