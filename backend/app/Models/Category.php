<?php

namespace App\Models;

use App\Enums\CategoryType;
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
}
