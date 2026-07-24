<?php

namespace App\Http\Controllers\Catalog;

use App\Enums\CategoryType;
use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Liste paginée du catalogue, avec filtres, recherche et tri.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user('sanctum');
        $priceExpression = Product::priceExpression($user);

        ProductResource::$activePromotion = $this->activePromotion();

        $query = Product::query()
            ->where('status', ProductStatus::Active)
            ->where('show_in_catalog', true)
            ->whereHas('media')
            ->with(['category:id,name,slug', 'primaryImage', 'primaryVideo', 'variants:id,product_id,stock']);

        $this->applyCategoryFilters($query, $request);
        $this->applyVariantFilters($query, $request);
        $this->applyPriceFilters($query, $request, $priceExpression);
        $this->applyFlagFilters($query, $request);
        $this->applySearch($query, $request);
        $this->applySort($query, $request, $priceExpression);

        $perPage = (int) $request->query('per_page', 12);
        $perPage = max(1, min($perPage, 48));

        $products = $query->paginate($perPage)->withQueryString();

        return ProductResource::collection($products);
    }

    /**
     * Détail d'un produit (variantes, médias, produits similaires).
     */
    public function show(Request $request, string $slug): ProductDetailResource
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('status', ProductStatus::Active)
            ->whereHas('media')
            ->with(['category', 'variants', 'media'])
            ->firstOrFail();

        $similarProducts = Product::query()
            ->where('status', ProductStatus::Active)
            ->where('show_in_catalog', true)
            ->whereHas('media')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category:id,name,slug', 'primaryImage', 'primaryVideo'])
            ->inRandomOrder()
            ->limit(4)
            ->get();

        ProductResource::$activePromotion = $this->activePromotion();

        return new ProductDetailResource($product, $similarProducts);
    }

    private function applyCategoryFilters(Builder $query, Request $request): void
    {
        if ($sectionSlug = $request->query('section')) {
            $section = Category::where('slug', $sectionSlug)->where('type', CategoryType::Section)->first();
            $query->where('category_id', $section?->id ?? 0);

            return;
        }

        if ($categorySlug = $request->query('category')) {
            $category = Category::where('slug', $categorySlug)->first();

            if (! $category) {
                $query->where('category_id', 0);

                return;
            }

            if ($category->type === CategoryType::Family) {
                $ids = $category->children()->pluck('id')->push($category->id);
                $query->whereIn('category_id', $ids);
            } else {
                $query->where('category_id', $category->id);
            }
        }
    }

    private function applyVariantFilters(Builder $query, Request $request): void
    {
        if ($size = $request->query('size')) {
            $query->whereHas('variants', fn ($q) => $q->where('size', $size));
        }

        if ($color = $request->query('color')) {
            $query->whereHas('variants', fn ($q) => $q->where('color', $color));
        }

        if ($request->boolean('in_stock')) {
            $query->whereHas('variants', fn ($q) => $q->where('stock', '>', 0));
        }
    }

    private function applyPriceFilters(Builder $query, Request $request, string $priceExpression): void
    {
        if ($request->filled('price_min')) {
            $query->whereRaw("{$priceExpression} >= ?", [(float) $request->query('price_min')]);
        }

        if ($request->filled('price_max')) {
            $query->whereRaw("{$priceExpression} <= ?", [(float) $request->query('price_max')]);
        }
    }

    private function applyFlagFilters(Builder $query, Request $request): void
    {
        if ($request->has('is_new')) {
            $query->where('is_new', $request->boolean('is_new'));
        }

        // Accepte ?promo=1 (usage interne) et ?has_promo=1 (frontend /promotions).
        // La promotion étant sitewide, tous les produits sont concernés quand elle
        // est active. Si aucune promotion n'est active, on retourne une liste vide.
        if ($request->boolean('promo') || $request->boolean('has_promo')) {
            if (! $this->activePromotion()) {
                $query->where('id', 0);
            }
        }
    }

    private function applySearch(Builder $query, Request $request): void
    {
        if ($q = $request->query('q')) {
            $query->where(
                fn ($inner) => $inner->where('name', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%")
            );
        }
    }

    private function applySort(Builder $query, Request $request, string $priceExpression): void
    {
        match ($request->query('sort', 'newest')) {
            'price_asc' => $query->orderByRaw("{$priceExpression} asc"),
            'price_desc' => $query->orderByRaw("{$priceExpression} desc"),
            default => $query->orderByDesc('created_at'),
        };
    }

    private function activePromotion(): ?Promotion
    {
        return Promotion::query()
            ->where('active', true)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->first();
    }
}
