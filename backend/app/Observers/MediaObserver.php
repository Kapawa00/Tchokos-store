<?php

namespace App\Observers;

use App\Models\Media;
use App\Services\FrontendRevalidator;

/**
 * Une photo/vidéo produit appartient à la fois à la fiche produit (galerie)
 * et, si c'est une vidéo, au mur de reels de l'accueil : les deux caches
 * doivent être invalidés.
 */
class MediaObserver
{
    public function __construct(private readonly FrontendRevalidator $revalidator)
    {
    }

    public function saved(Media $media): void
    {
        $this->revalidate($media);
    }

    public function deleted(Media $media): void
    {
        $this->revalidate($media);
    }

    private function revalidate(Media $media): void
    {
        $tags = ['reels'];
        $slug = $media->product?->slug;

        if ($slug) {
            $tags[] = 'products';
            $tags[] = "product:{$slug}";
        }

        $this->revalidator->revalidate($tags);
    }
}
