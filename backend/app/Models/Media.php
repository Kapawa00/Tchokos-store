<?php

namespace App\Models;

use App\Enums\MediaType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    protected $fillable = [
        'product_id',
        'type',
        'url',
        'poster_url',
        'position',
        'is_featured_reel',
        'reel_position',
    ];

    protected function casts(): array
    {
        return [
            'type' => MediaType::class,
            'is_featured_reel' => 'boolean',
            'reel_position' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
