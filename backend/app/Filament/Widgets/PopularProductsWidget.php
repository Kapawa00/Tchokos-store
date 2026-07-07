<?php

namespace App\Filament\Widgets;

use App\Models\OrderItem;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

// Remplacé par Top10ProductsChart (graphique barre horizontale) sur le Dashboard.
// Ce widget reste disponible pour d'autres pages Filament si besoin.
class PopularProductsWidget extends BaseWidget
{
    protected static ?string $heading = 'Produits populaires';

    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                // Agrégation des ventes par nom de produit (les lignes de commande
                // figent le nom au moment de l'achat). MIN(id) sert de clé unique.
                OrderItem::query()
                    ->selectRaw('MIN(id) as id, product_name, SUM(quantity) as qty, SUM(quantity * unit_price) as revenue')
                    ->groupBy('product_name')
                    ->orderByDesc('qty')
            )
            ->paginated([5, 10])
            ->defaultPaginationPageOption(5)
            ->columns([
                Tables\Columns\TextColumn::make('product_name')->label('Produit'),
                Tables\Columns\TextColumn::make('qty')->label('Vendus')->badge()->color('success'),
                Tables\Columns\TextColumn::make('revenue')
                    ->label('CA')
                    ->formatStateUsing(fn ($state) => number_format((float) $state, 0, ',', ' ').' FCFA'),
            ]);
    }
}
