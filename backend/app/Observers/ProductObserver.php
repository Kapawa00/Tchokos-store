<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\FrontendRevalidator;

class ProductObserver
{
    public function __construct(private readonly FrontendRevalidator $revalidator)
    {
    }

    public function saved(Product $product): void
    {
        $this->revalidator->revalidate(['products', "product:{$product->slug}"]);
    }

    public function deleted(Product $product): void
    {
        $this->revalidator->revalidate(['products', "product:{$product->slug}"]);
    }
}
