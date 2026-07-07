<?php

namespace Database\Seeders;

use App\Enums\OrderChannel;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\TransactionStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Distribution des statuts pour les ~12 commandes de démonstration.
     *
     * @var array<int, OrderStatus>
     */
    private const STATUS_PLAN = [
        OrderStatus::PendingPayment,
        OrderStatus::PendingPayment,
        OrderStatus::PendingPayment,
        OrderStatus::Paid,
        OrderStatus::Paid,
        OrderStatus::Preparing,
        OrderStatus::Preparing,
        OrderStatus::Shipped,
        OrderStatus::Shipped,
        OrderStatus::Delivered,
        OrderStatus::Delivered,
        OrderStatus::Cancelled,
    ];

    public function run(): void
    {
        $customers = User::where('role', UserRole::Customer)->get();
        $variants = Variant::with('product')->inRandomOrder()->limit(60)->get();

        foreach (self::STATUS_PLAN as $status) {
            $isGuest = fake()->boolean(30);
            $customer = $isGuest ? null : $customers->random();

            $order = Order::create([
                'user_id' => $customer?->id,
                'customer_name' => $customer?->name ?? fake()->name(),
                'customer_phone' => $customer?->phone ?? fake()->numerify('6########'),
                'customer_email' => $customer?->email,
                'channel' => fake()->randomElement(OrderChannel::cases()),
                'status' => $status,
                'subtotal' => 0,
                'shipping_fee' => 1500,
                'total' => 0,
                'notes' => $status === OrderStatus::Cancelled ? 'Annulée : client injoignable.' : null,
            ]);

            $subtotal = 0;
            $itemsCount = fake()->numberBetween(1, 3);

            foreach ($variants->random($itemsCount) as $variant) {
                $unitPrice = $variant->price_override ?? $variant->product->base_price;
                $quantity = fake()->numberBetween(1, 2);
                $subtotal += $unitPrice * $quantity;

                $variantLabel = trim(implode(' - ', array_filter([$variant->size, $variant->color])));

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_name' => $variant->product->name,
                    'variant_label' => $variantLabel ?: null,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                ]);
            }

            $order->update([
                'subtotal' => $subtotal,
                'total' => $subtotal + $order->shipping_fee,
            ]);

            $this->createTransaction($order, $status);
        }
    }

    private function createTransaction(Order $order, OrderStatus $status): void
    {
        match ($status) {
            OrderStatus::Paid, OrderStatus::Preparing, OrderStatus::Shipped, OrderStatus::Delivered => Transaction::factory()->create([
                'order_id' => $order->id,
                'method' => fake()->randomElement(PaymentMethod::cases()),
                'status' => TransactionStatus::Confirmed,
                'amount' => $order->total,
            ]),
            OrderStatus::Cancelled => fake()->boolean(50) ? Transaction::factory()->failed()->create([
                'order_id' => $order->id,
                'method' => fake()->randomElement(PaymentMethod::cases()),
                'amount' => $order->total,
            ]) : null,
            OrderStatus::PendingPayment => fake()->boolean(40) ? Transaction::factory()->pending()->create([
                'order_id' => $order->id,
                'method' => PaymentMethod::Whatsapp,
                'amount' => $order->total,
            ]) : null,
        };
    }
}
