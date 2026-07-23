<?php

namespace App\Models;

use App\Enums\CategoryType;
use App\Enums\MediaType;
use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory, HasUniqueSlug;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'parent_id',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'type' => CategoryType::class,
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('position');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Première image (par ordre de création) parmi les produits de cette
     * catégorie — et de ses rayons enfants pour une famille. Sert de visuel
     * de repli aux cartes « Nos rayons » de l'accueil tant qu'aucune bannière
     * n'est définie manuellement : dès qu'un produit est créé avec des
     * médias dans une catégorie/rayon, sa première image l'illustre.
     */
    public function firstProductImage(): ?Media
    {
        $categoryIds = $this->relationLoaded('children')
            ? $this->children->pluck('id')->push($this->id)
            : $this->children()->pluck('id')->push($this->id);

        return Media::query()
            ->where('type', MediaType::Image)
            ->whereHas('product', fn ($query) => $query->whereIn('category_id', $categoryIds))
            ->oldest('created_at')
            ->oldest('id')
            ->first();
    }
}
