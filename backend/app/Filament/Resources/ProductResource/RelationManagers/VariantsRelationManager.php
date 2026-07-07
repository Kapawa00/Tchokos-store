<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    protected static ?string $title = 'Variantes (pointure / couleur / stock)';

    protected static ?string $modelLabel = 'variante';

    protected static ?string $pluralModelLabel = 'variantes';

    public function form(Form $form): Form
    {
        return $form->columns(2)->schema([
            Forms\Components\TextInput::make('size')
                ->label('Pointure / taille')
                ->maxLength(50),

            Forms\Components\TextInput::make('color')
                ->label('Couleur')
                ->maxLength(50),

            Forms\Components\TextInput::make('sku')
                ->label('SKU (référence)')
                ->required()
                ->unique(ignoreRecord: true)
                ->default(fn () => 'TCK-'.Str::upper(Str::random(8)))
                ->maxLength(100),

            Forms\Components\TextInput::make('stock')
                ->label('Stock')
                ->numeric()
                ->minValue(0)
                ->default(0)
                ->required(),

            Forms\Components\TextInput::make('price_override')
                ->label('Prix spécifique (optionnel)')
                ->helperText('Remplace le prix du produit pour cette variante.')
                ->numeric()
                ->minValue(0)
                ->suffix('FCFA'),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('sku')
            ->columns([
                Tables\Columns\TextColumn::make('size')->label('Pointure')->placeholder('—'),
                Tables\Columns\TextColumn::make('color')->label('Couleur')->placeholder('—'),
                Tables\Columns\TextColumn::make('sku')->label('SKU')->searchable(),
                Tables\Columns\TextColumn::make('stock')
                    ->label('Stock')
                    ->badge()
                    ->color(fn ($state) => $state <= 0 ? 'danger' : ($state < 5 ? 'warning' : 'success')),
                Tables\Columns\TextColumn::make('price_override')
                    ->label('Prix spécifique')
                    ->money('XAF')
                    ->placeholder('—'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()->label('Ajouter une variante'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }
}
