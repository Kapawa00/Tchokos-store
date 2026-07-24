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
    public function __construct(private readonly FrontendRevalidator $revalidator) {}

    /**
     * Un seul média peut être la vidéo héro à la fois : en activer une
     * désactive automatiquement toute autre, pour ne jamais avoir deux
     * vidéos « héro » en même temps sans intervention manuelle.
     */
    public function saving(Media $media): void
    {
        if (! $media->is_hero) {
            return;
        }

        $query = Media::where('is_hero', true);

        if ($media->exists) {
            $query->where('id', '!=', $media->id);
        }

        $query->update(['is_hero' => false]);
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
