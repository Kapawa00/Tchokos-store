<?php

namespace App\Models;

use App\Enums\WholesaleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WholesaleAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'company',
        'city',
        'item_type',
        'volume',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => WholesaleStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
