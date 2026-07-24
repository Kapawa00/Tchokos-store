<?php

namespace App\Http\Controllers\Catalog;

use App\Enums\MediaType;
use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReelResource;
use App\Models\Media;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReelController extends Controller
{
    /**
     * « Mur de reels » de l'accueil : uniquement les vidéos explicitement
     * marquées is_featured_reel, ordonnées par reel_position. Aucun repli sur
     * les vidéos les plus récentes : une vidéo ajoutée pour un produit ou pour
     * le hero ne doit jamais apparaître ici sans un choix explicite de
     * l'admin. Le mur peut donc être vide — géré côté frontend.
     * Vitrine autonome : une vidéo n'a pas besoin d'être rattachée à un
     * produit ; si elle l'est, ce produit doit être actif pour apparaître.
     */
    public function index(): AnonymousResourceCollection
    {
        $reels = $this->visibleVideos()
            ->where('is_featured_reel', true)
            ->orderBy('reel_position')
            ->limit(12)
            ->get();

        return ReelResource::collection($reels);
    }

    /**
     * Vidéo de fond du hero de l'accueil : sélection explicite (is_hero),
     * indépendante du mur de reels — activer/désactiver un reel n'y touche
     * pas. Repli sur un hero sans vidéo (dégradé « cuir & crème ») tant
     * qu'aucune vidéo n'a été désignée héro.
     */
    public function hero(): JsonResponse
    {
        $hero = $this->visibleVideos()->where('is_hero', true)->first();

        return response()->json([
            'data' => $hero ? new ReelResource($hero) : null,
        ]);
    }

    private function visibleVideos(): Builder
    {
        return Media::query()
            ->where('type', MediaType::Video)
            ->where(function ($query) {
                $query->whereNull('product_id')
                    ->orWhereHas('product', fn ($q) => $q->where('status', ProductStatus::Active));
            })
            ->with('product:id,name,slug');
    }
}
