<?php

namespace App\Http\Controllers\Shop;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\Variant;
use App\Services\CartResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    private const ITEM_RELATIONS = 'items.variant.product.primaryImage';

    public function __construct(private readonly CartResolver $cartResolver)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $cart = $this->cartResolver->resolve($request);

        return $this->cartResponse($cart);
    }

    public function addItem(AddCartItemRequest $request): JsonResponse
    {
        $cart = $this->cartResolver->resolve($request);

        return DB::transaction(function () use ($request, $cart) {
            $variant = Variant::with('product')->lockForUpdate()->findOrFail($request->integer('variant_id'));

            if ($variant->product->status !== ProductStatus::Active) {
                throw ValidationException::withMessages([
                    'variant_id' => ['Ce produit n\'est plus disponible.'],
                ]);
            }

            $quantity = $request->integer('quantity');
            $existing = $cart->items()->where('variant_id', $variant->id)->first();
            $newQuantity = $quantity + ($existing?->quantity ?? 0);

            $this->assertStockAvailable($variant, $newQuantity);

            $unitPrice = $variant->price_override ?? $variant->product->display_price;

            if ($existing) {
                $existing->update(['quantity' => $newQuantity, 'unit_price' => $unitPrice]);
            } else {
                $cart->items()->create([
                    'variant_id' => $variant->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                ]);
            }

            return $this->cartResponse($cart);
        });
    }

    public function updateItem(UpdateCartItemRequest $request, int $item): JsonResponse
    {
        $cart = $this->cartResolver->resolve($request);

        return DB::transaction(function () use ($request, $cart, $item) {
            $cartItem = $cart->items()->where('id', $item)->firstOrFail();
            $variant = Variant::lockForUpdate()->findOrFail($cartItem->variant_id);

            $quantity = $request->integer('quantity');
            $this->assertStockAvailable($variant, $quantity);

            $cartItem->update(['quantity' => $quantity]);

            return $this->cartResponse($cart);
        });
    }

    public function removeItem(Request $request, int $item): JsonResponse
    {
        $cart = $this->cartResolver->resolve($request);
        $cart->items()->where('id', $item)->firstOrFail()->delete();

        return $this->cartResponse($cart);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->cartResolver->resolve($request);
        $cart->items()->delete();

        return $this->cartResponse($cart);
    }

    /**
     * Le panier n'est jamais la ressource "créée" du point de vue de l'API
     * (même si la première requête d'un invité crée la ligne en base) :
     * on force toujours un 200, pour éviter qu'Eloquent ne déclenche un 201
     * via `wasRecentlyCreated` sur ces routes de lecture/mise à jour.
     */
    private function cartResponse(Cart $cart): JsonResponse
    {
        return (new CartResource($cart->load(self::ITEM_RELATIONS)))
            ->response()
            ->setStatusCode(200);
    }

    private function assertStockAvailable(Variant $variant, int $requestedQuantity): void
    {
        if ($requestedQuantity > $variant->stock) {
            throw ValidationException::withMessages([
                'quantity' => ["Stock insuffisant (disponible : {$variant->stock})."],
            ]);
        }
    }
}
