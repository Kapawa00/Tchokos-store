<?php

namespace App\Events;

use App\Models\Variant;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Déclenché quand le stock d'une variante repasse de 0 (ou moins) à une
 * valeur positive.
 */
class ProductBackInStock
{
    use Dispatchable;

    public function __construct(public readonly Variant $variant)
    {
    }
}
