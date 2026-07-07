<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BannerController extends Controller
{
    /**
     * Bannières actives de la page d'accueil, ordonnées par position.
     */
    public function index(): AnonymousResourceCollection
    {
        $banners = Banner::query()
            ->where('active', true)
            ->orderBy('position')
            ->get();

        return BannerResource::collection($banners);
    }
}
