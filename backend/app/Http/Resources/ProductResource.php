<?php

namespace App\Http\Resources;

use App\Enums\PromotionType;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    /**
     * Promotion sitewide active à appliquer aux produits de la requête en
     * cours (le schéma ne lie pas les promotions à un produit précis).
     * Doit être réassignée par le contrôleur à chaque requête.
     */
    public static ?Promotion $activePromotion = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'excerpt' => $this->description ? str(strip_tags($this->description))->limit(120) : null,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'price' => $this->display_price,
            'promo_price' => $this->promoPrice(),
            'is_new' => $this->is_new,
            'in_stock' => $this->whenLoaded('variants', fn () => $this->variants->contains(fn ($variant) => $variant->stock > 0)),
            'primary_image' => $this->primaryVisualUrl(),
            'badge' => $this->badge(),
        ];
    }

    /**
     * Prix promo affiché : priorité au prix promo défini sur le produit
     * lui-même (détail/gros selon le rôle, cf. `Product::displayPromoPrice`),
     * sinon repli sur la promotion sitewide active.
     */
    private function promoPrice(): ?string
    {
        if ($this->display_promo_price !== null) {
            return number_format((float) $this->display_promo_price, 2, '.', '');
        }

        $promotion = self::$activePromotion;

        if (! $promotion) {
            return null;
        }

        $price = (float) $this->display_price;

        $discounted = $promotion->type === PromotionType::Percent
            ? $price * (1 - ((float) $promotion->value / 100))
            : max($price - (float) $promotion->value, 0);

        return number_format($discounted, 2, '.', '');
    }

    /**
     * @return array<string, string>|null
     */
    private function badge(): ?array
    {
        if ($this->is_new) {
            return ['type' => 'new', 'label' => 'Nouveau'];
        }

        if ($this->display_promo_price !== null) {
            $price = (float) $this->display_price;
            $discount = $price > 0 ? (1 - ((float) $this->display_promo_price / $price)) * 100 : 0;

            return ['type' => 'discount', 'label' => '-'.rtrim(rtrim(number_format($discount, 1), '0'), '.').'%'];
        }

        if (self::$activePromotion) {
            $promotion = self::$activePromotion;
            $label = $promotion->type === PromotionType::Percent
                ? '-'.rtrim(rtrim((string) $promotion->value, '0'), '.').'%'
                : '-'.number_format((float) $promotion->value, 0, ',', ' ').' FCFA';

            return ['type' => 'discount', 'label' => $label];
        }

        return null;
    }
}
