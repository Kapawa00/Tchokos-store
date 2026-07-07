<?php

namespace App\Observers;

use App\Models\Promotion;
use App\Services\FrontendRevalidator;

/**
 * Une promotion est toujours sitewide (cf. ProductController::activePromotion) :
 * le tag "products" suffit, chaque fiche produit y étant elle-même taguée
 * (lib/catalog.js → getProduct()), donc le prix barré/badge s'y invalide aussi.
 */
class PromotionObserver
{
    public function __construct(private readonly FrontendRevalidator $revalidator)
    {
    }

    public function saved(Promotion $promotion): void
    {
        $this->revalidator->revalidate(['products']);
    }

    public function deleted(Promotion $promotion): void
    {
        $this->revalidator->revalidate(['products']);
    }
}
