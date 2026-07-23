<?php

namespace App\Http\Controllers\Shop;

use App\Enums\OrderStatus;
use App\Events\OrderCreated;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Concerns\AuthorizesOrderAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Variant;
use App\Services\CartResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    use AuthorizesOrderAccess;

    /** Frais de livraison forfaitaire (FCFA), en l'absence de calcul par zone. */
    private const SHIPPING_FEE = 1500;

    public function __construct(private readonly CartResolver $cartResolver) {}

    /**
     * Commandes de l'utilisateur connecté.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()->orders()->with('items')->latest()->paginate(10);

        return OrderResource::collection($orders);
    }

    /**
     * Crée une commande à partir du panier courant (connecté ou invité).
     */
    public function store(StoreOrderRequest $request): OrderResource
    {
        $cart = $this->cartResolver->resolve($request);
        $cart->loadMissing('items.variant.product');

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Le panier est vide.'],
            ]);
        }

        $user = $request->user('sanctum');
        $data = $request->validated();

        try {
            $order = $this->createOrderFromCart($cart, $user, $data);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            // Repère facilement identifiable dans les logs Railway (stderr) :
            // sans ce log, un échec de commande ne laissait qu'une ligne
            // d'accès générique ("/api/orders ~0.15ms"), la vraie exception
            // restant dans storage/logs/laravel.log, invisible depuis "View
            // logs" (qui ne capture que stdout/stderr du process).
            Log::error("[ORDER_CREATE_FAILED] {$e->getMessage()}", [
                'user_id' => $user?->id,
                'cart_id' => $cart->id,
                'items_count' => $cart->items->count(),
                'variant_ids' => $cart->items->pluck('variant_id')->all(),
                'channel' => $data['channel'] ?? null,
                'exception' => $e::class,
                'file' => $e->getFile().':'.$e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }

        try {
            // La commande est déjà enregistrée à ce stade : quoi qu'il arrive
            // en aval (listener de notification mal configuré, dépendance
            // manquante...), ça ne doit jamais transformer une commande
            // réussie en 500 côté client (cf. déjà appliqué à l'e-mail de
            // confirmation dans SendOrderCreatedNotifications).
            OrderCreated::dispatch($order);
        } catch (\Throwable $e) {
            Log::error("[ORDER_CREATED_EVENT_FAILED] {$e->getMessage()}", [
                'order_reference' => $order->reference,
                'exception' => $e::class,
                'file' => $e->getFile().':'.$e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return new OrderResource($order->load('items'));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createOrderFromCart(Cart $cart, ?User $user, array $data): Order
    {
        return DB::transaction(function () use ($cart, $user, $data) {
            // Verrouille les variantes concernées pour éviter une survente en
            // cas de requêtes de commande concurrentes sur le même stock.
            $lockedVariants = Variant::whereIn('id', $cart->items->pluck('variant_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($cart->items as $item) {
                $variant = $lockedVariants->get($item->variant_id);

                if (! $variant || $variant->stock < $item->quantity) {
                    $available = $variant?->stock ?? 0;

                    throw ValidationException::withMessages([
                        'cart' => ["Stock insuffisant pour {$item->variant->product->name} (disponible : {$available})."],
                    ]);
                }
            }

            $subtotal = $cart->items->sum(fn ($item) => $item->quantity * (float) $item->unit_price);

            $order = Order::create([
                'user_id' => $user?->id,
                'customer_name' => $data['customer_name'] ?? $user?->name,
                'customer_phone' => $data['customer_phone'] ?? $user?->phone,
                'customer_email' => $data['customer_email'] ?? $user?->email,
                'channel' => $data['channel'],
                'status' => OrderStatus::PendingPayment,
                'subtotal' => $subtotal,
                'shipping_fee' => self::SHIPPING_FEE,
                'total' => $subtotal + self::SHIPPING_FEE,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($cart->items as $item) {
                $variant = $lockedVariants->get($item->variant_id);
                $variantLabel = trim(implode(' - ', array_filter([$variant->size, $variant->color])));

                $order->items()->create([
                    'product_name' => $item->variant->product->name,
                    'variant_label' => $variantLabel ?: null,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                ]);

                $variant->decrement('stock', $item->quantity);
            }

            $cart->items()->delete();

            return $order;
        });
    }

    /**
     * Détail d'une commande par référence. Accès : son propriétaire,
     * l'admin/gestionnaire, ou un invité prouvant son identité (téléphone ou
     * e-mail correspondant à la commande).
     */
    public function show(Request $request, string $reference): OrderResource
    {
        $order = Order::where('reference', $reference)->with(['items', 'transaction'])->firstOrFail();

        $this->authorizeOrderAccess($request, $order);

        return new OrderResource($order);
    }

    /**
     * Changement de statut, réservé à l'admin/gestionnaire (cf. middleware
     * `role:admin,manager` sur la route).
     */
    public function updateStatus(UpdateOrderStatusRequest $request, string $reference): OrderResource
    {
        $order = Order::where('reference', $reference)->firstOrFail();

        if (in_array($order->status, [OrderStatus::Delivered, OrderStatus::Cancelled], true)) {
            throw ValidationException::withMessages([
                'status' => ['Cette commande est dans un statut final et ne peut plus être modifiée.'],
            ]);
        }

        $previousStatus = $order->status;
        $order->update(['status' => $request->validated('status')]);

        if ($order->status !== $previousStatus) {
            // Validation manuelle d'une preuve WhatsApp : l'admin fait passer
            // la commande à "paid" depuis le back-office, ce qui confirme
            // aussi la transaction restée "en attente de validation".
            if ($order->status === OrderStatus::Paid) {
                Transaction::where('order_id', $order->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'confirmed']);
            }

            try {
                OrderStatusUpdated::dispatch($order, $previousStatus);
            } catch (\Throwable $e) {
                Log::error("[ORDER_STATUS_EVENT_FAILED] {$e->getMessage()}", [
                    'order_reference' => $order->reference,
                    'exception' => $e::class,
                    'file' => $e->getFile().':'.$e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        return new OrderResource($order->load('items'));
    }

    private function authorizeView(Request $request, Order $order): void
    {
        $user = $request->user('sanctum');

        if ($user && in_array($user->role, [UserRole::Admin, UserRole::Manager], true)) {
            return;
        }

        if ($user && $order->user_id === $user->id) {
            return;
        }

        if ($order->user_id === null) {
            $phone = $request->query('phone');
            $email = $request->query('email');

            if (($phone && $phone === $order->customer_phone) || ($email && $email === $order->customer_email)) {
                return;
            }
        }

        abort(403, "Vous n'avez pas accès à cette commande.");
    }
}
