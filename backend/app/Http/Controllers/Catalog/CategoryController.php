<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * Arborescence complète : familles avec leurs rayons en enfants.
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->orderBy('position')
            ->with(['children' => fn ($query) => $query->orderBy('position')])
            ->get();

        return CategoryResource::collection($categories);
    }
}
