<?php

namespace App\Http\Controllers\Catalog;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\SearchSuggestionResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SearchController extends Controller
{
    /**
     * Suggestions rapides (autocomplete) sur le nom des produits.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $q = trim((string) $request->query('q', ''));

        if ($q === '') {
            return SearchSuggestionResource::collection(collect());
        }

        $products = Product::query()
            ->where('status', ProductStatus::Active)
            ->where('show_in_catalog', true)
            ->where('name', 'like', "%{$q}%")
            ->with('primaryImage')
            ->orderBy('name')
            ->limit(8)
            ->get();

        return SearchSuggestionResource::collection($products);
    }
}
