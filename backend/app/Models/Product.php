<?php

namespace App\Models;

use App\Enums\MediaType;
use App\Enums\ProductStatus;
use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;

class Product extends Model
{
    use HasFactory, HasUniqueSlug;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'category_id',
        'base_price',
        'wholesale_price',
        'promo_price',
        'promo_wholesale_price',
        'status',
        'show_in_catalog',
        'is_new',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'wholesale_price' => 'decimal:2',
            'promo_price' => 'decimal:2',
            'promo_wholesale_price' => 'decimal:2',
            'status' => ProductStatus::class,
            'show_in_catalog' => 'boolean',
            'is_new' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(Variant::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class)->orderBy('position');
    }

    /**
     * Première image du produit (par position). Implémentée via `ofMany()`
     * plutôt qu'une contrainte `limit()` sur `media()`, qui ne renverrait
     * qu'un seul média au total pour l'ensemble des produits chargés en lot.
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(Media::class)->where('type', MediaType::Image)->oldestOfMany('position');
    }

    /**
     * Expression SQL du prix vu par l'utilisateur courant : prix de gros pour
     * un grossiste approuvé (si défini), sinon prix détail. Utilisée pour le
     * filtrage par fourchette de prix et le tri par prix dans le catalogue.
     */
    public static function priceExpression(?User $user): string
    {
        return $user?->isApprovedWholesaler()
            ? 'COALESCE(wholesale_price, base_price)'
            : 'base_price';
    }

    /**
     * Prix à afficher selon l'utilisateur connecté : prix de gros pour un
     * grossiste dont le wholesale_account est approuvé (et si un prix de
     * gros est défini), sinon prix détail.
     */
    protected function displayPrice(): Attribute
    {
        return Attribute::make(
            get: function () {
                $user = Auth::user();

                if ($user?->isApprovedWholesaler() && $this->wholesale_price !== null) {
                    return $this->wholesale_price;
                }

                return $this->base_price;
            },
        );
    }

    /**
     * Prix promo par produit selon l'utilisateur courant : promo grossiste
     * pour un grossiste approuvé (si définie), sinon promo détail. `null` si
     * aucune promo n'est définie pour ce produit (cf. `App\Http\Resources\ProductResource`
     * pour le repli sur la promotion sitewide).
     */
    protected function displayPromoPrice(): Attribute
    {
        return Attribute::make(
            get: function () {
                $user = Auth::user();

                if ($user?->isApprovedWholesaler()) {
                    return $this->promo_wholesale_price;
                }

                return $this->promo_price;
            },
        );
    }
}
