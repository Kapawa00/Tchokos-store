<?php

namespace App\Enums;

enum CategoryType: string
{
    case Family = 'family';
    case Section = 'section';

    public function label(): string
    {
        return match ($this) {
            self::Family => 'Famille',
            self::Section => 'Rayon',
        };
    }
}
