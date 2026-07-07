<?php

namespace App\Filament\Resources\OrderResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $title = 'Articles de la commande';

    protected static ?string $modelLabel = 'article';

    protected static ?string $pluralModelLabel = 'articles';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('product_name')
            ->columns([
                Tables\Columns\TextColumn::make('product_name')->label('Produit'),
                Tables\Columns\TextColumn::make('variant_label')->label('Variante')->placeholder('—'),
                Tables\Columns\TextColumn::make('quantity')->label('Qté'),
                Tables\Columns\TextColumn::make('unit_price')->label('Prix unitaire')->money('XAF'),
                Tables\Columns\TextColumn::make('line_total')
                    ->label('Total ligne')
                    ->money('XAF')
                    ->state(fn ($record) => $record->quantity * $record->unit_price),
            ])
            // Articles en lecture seule : une commande finalisée ne se modifie pas à la main.
            ->paginated(false);
    }
}
