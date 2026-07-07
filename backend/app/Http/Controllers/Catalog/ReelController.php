<?php

namespace App\Http\Controllers\Catalog;

use App\Enums\MediaType;
use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReelResource;
use App\Models\Media;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReelController extends Controller
{
    /**
     * « Mur de reels » de l'accueil : vidéos mises en avant (is_featured_reel),
     * ordonnées par reel_position. À défaut de sélection, repli sur les vidéos
     * les plus récentes pour ne jamais présenter un mur vide.
     * Vitrine autonome : une vidéo n'a pas besoin d'être rattachée à un
     * produit ; si elle l'est, ce produit doit être actif pour apparaître.
     */
    public function index(): AnonymousResourceCollection
    {
        $base = Media::query()
            ->where('type', MediaType::Video)
            ->where(function ($query) {
                $query->whereNull('product_id')
                    ->orWhereHas('product', fn ($q) => $q->where('status', ProductStatus::Active));
            })
            ->with('product:id,name,slug');

        $featured = (clone $base)
            ->where('is_featured_reel', true)
            ->orderBy('reel_position')
            ->limit(12)
            ->get();

        $reels = $featured->isNotEmpty()
            ? $featured
            : (clone $base)->latest('id')->limit(12)->get();

        return ReelResource::collection($reels);
    }
}
