<?php

namespace App\Observers;

use App\Events\ProductBackInStock;
use App\Models\Variant;
use App\Services\FrontendRevalidator;

class VariantObserver
{
    public function __construct(private readonly FrontendRevalidator $revalidator)
    {
    }

    public function updated(Variant $variant): void
    {
        if ($variant->wasChanged('stock') && $variant->getOriginal('stock') <= 0 && $variant->stock > 0) {
            ProductBackInStock::dispatch($variant);
        }
    }

    // saved() couvre à la fois la création et la mise à jour (updated() se
    // déclenche aussi, mais uniquement pour la notification back-in-stock
    // ci-dessus, afin d'éviter un double appel de revalidation).
    public function saved(Variant $variant): void
    {
        $this->revalidate($variant);
    }

    public function deleted(Variant $variant): void
    {
        $this->revalidate($variant);
    }

    private function revalidate(Variant $variant): void
    {
        $slug = $variant->product?->slug;
        $tags = ['products'];

        if ($slug) {
            $tags[] = "product:{$slug}";
        }

        $this->revalidator->revalidate($tags);
    }
}
