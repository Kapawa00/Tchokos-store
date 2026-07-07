<?php

namespace App\Models;

use App\Enums\OrderChannel;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reference',
        'customer_name',
        'customer_phone',
        'customer_email',
        'channel',
        'status',
        'subtotal',
        'shipping_fee',
        'total',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'channel' => OrderChannel::class,
            'status' => OrderStatus::class,
            'subtotal' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->reference)) {
                $order->reference = static::generateReference();
            }
        });
    }

    /**
     * Référence lisible du type TCK-2026-000123 : préfixe boutique, année en
     * cours, et numéro de séquence remis à zéro chaque année.
     */
    public static function generateReference(): string
    {
        $year = now()->year;

        $sequence = static::whereYear('created_at', $year)->count() + 1;

        return sprintf('TCK-%d-%06d', $year, $sequence);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class)->latestOfMany();
    }

    protected function isPaid(): Attribute
    {
        return Attribute::make(
            get: fn () => ! in_array($this->status, [OrderStatus::PendingPayment, OrderStatus::Cancelled], true),
        );
    }
}
