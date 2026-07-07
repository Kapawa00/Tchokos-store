<?php

namespace App\Filament\Widgets;

use App\Models\Variant;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LowStockWidget extends BaseWidget
{
    protected static ?string $heading = 'Stock faible (≤ 5)';

    protected static ?int $sort = 11;

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        $threshold = (int) config('shop.low_stock_threshold', 5);

        return $table
            ->query(
                Variant::query()->with('product')->where('stock', '<=', $threshold)->orderBy('stock')
            )
            ->paginated([5, 10])
            ->defaultPaginationPageOption(5)
            ->columns([
                Tables\Columns\TextColumn::make('product.name')->label('Produit'),
                Tables\Columns\TextColumn::make('label')
                    ->label('Variante')
                    ->state(fn (Variant $r) => trim(($r->size ?? '').' '.($r->color ?? '')) ?: '—'),
                Tables\Columns\TextColumn::make('sku')->label('SKU'),
                Tables\Columns\TextColumn::make('stock')
                    ->label('Stock')
                    ->badge()
                    ->color(fn ($state) => $state <= 0 ? 'danger' : 'warning'),
            ])
            ->emptyStateHeading('Aucun stock faible')
            ->emptyStateDescription('Toutes les variantes ont un stock suffisant.');
    }
}
