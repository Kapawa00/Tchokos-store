<?php

namespace App\Http\Resources;

use App\Enums\PromotionType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin \App\Models\Product
 */
class ProductDetailResource extends JsonResource
{
    /**
     * @param  \App\Models\Product  $resource
     * @param  \Illuminate\Support\Collection<int, \App\Models\Product>|null  $similarProducts
     */
    public function __construct($resource, protected ?Collection $similarProducts = null)
    {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'price' => $this->display_price,
            'promo_price' => $this->promoPrice(),
            'is_new' => $this->is_new,
            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map(
                fn ($variant) => new VariantResource($variant, $this->display_price)
            )),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'similar_products' => $this->similarProducts !== null
                ? ProductResource::collection($this->similarProducts)
                : [],
        ];
    }

    /**
     * Prix promo affiché : priorité au prix promo du produit (détail/gros
     * selon le rôle), sinon repli sur la promotion sitewide active — même
     * logique que `App\Http\Resources\ProductResource::promoPrice()`.
     */
    private function promoPrice(): ?string
    {
        if ($this->display_promo_price !== null) {
            return number_format((float) $this->display_promo_price, 2, '.', '');
        }

        $promotion = ProductResource::$activePromotion;

        if (! $promotion) {
            return null;
        }

        $price = (float) $this->display_price;

        $discounted = $promotion->type === PromotionType::Percent
            ? $price * (1 - ((float) $promotion->value / 100))
            : max($price - (float) $promotion->value, 0);

        return number_format($discounted, 2, '.', '');
    }
}
