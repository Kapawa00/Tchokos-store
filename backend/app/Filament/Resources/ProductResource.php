<?php

namespace App\Filament\Resources;

use App\Enums\ProductStatus;
use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'Catalogue';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'produit';

    protected static ?string $pluralModelLabel = 'produits';

    protected static ?string $navigationLabel = 'Produits';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Informations')
                ->description('Nom, rayon et description du produit.')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('name')
                        ->label('Nom')
                        ->required()
                        ->maxLength(255)
                        ->live(onBlur: true)
                        // Pré-remplit le slug à partir du nom tant que l'utilisateur ne l'a pas saisi.
                        ->afterStateUpdated(function (Forms\Set $set, ?string $state, Forms\Get $get) {
                            if (blank($get('slug'))) {
                                $set('slug', Str::slug((string) $state));
                            }
                        }),

                    Forms\Components\TextInput::make('slug')
                        ->label('Slug (URL)')
                        ->helperText('Laisser vide pour générer automatiquement.')
                        ->maxLength(255)
                        ->unique(ignoreRecord: true),

                    Forms\Components\Select::make('category_id')
                        ->label('Catégorie')
                        ->relationship('category', 'name')
                        ->searchable()
                        ->preload()
                        ->required(),

                    Forms\Components\Select::make('status')
                        ->label('Statut')
                        ->options(collect(ProductStatus::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()]))
                        ->default(ProductStatus::Draft->value)
                        ->required(),

                    Forms\Components\Toggle::make('show_in_catalog')
                        ->label('Afficher dans la boutique')
                        ->helperText('Décochez pour garder ce produit hors du catalogue (recherche, listes, similaires) tout en le gardant utilisable pour un reel (vidéo mise en avant sur l\'accueil).')
                        ->default(true)
                        ->inline(false),

                    Forms\Components\Textarea::make('description')
                        ->label('Description')
                        ->rows(4)
                        ->columnSpanFull(),
                ]),

            Forms\Components\Section::make('Tarifs & badges')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('base_price')
                        ->label('Prix détail')
                        ->numeric()
                        ->required()
                        ->minValue(0)
                        ->suffix('FCFA'),

                    Forms\Components\TextInput::make('wholesale_price')
                        ->label('Prix grossiste')
                        ->helperText('Visible uniquement par les grossistes approuvés.')
                        ->numeric()
                        ->minValue(0)
                        ->suffix('FCFA'),

                    Forms\Components\TextInput::make('promo_price')
                        ->label('Ancien prix / Prix promo détail')
                        ->helperText('Laisser vide si ce produit n\'est pas en promo. Affiché barré face au prix détail.')
                        ->numeric()
                        ->minValue(0)
                        ->suffix('FCFA'),

                    Forms\Components\TextInput::make('promo_wholesale_price')
                        ->label('Prix promo grossiste')
                        ->helperText('Promo réservée aux grossistes approuvés, indépendante de la promo détail.')
                        ->numeric()
                        ->minValue(0)
                        ->suffix('FCFA'),

                    Forms\Components\Toggle::make('is_new')
                        ->label('Badge « Nouveau »')
                        ->inline(false),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('primaryImage.url')
                    ->label('Visuel')
                    ->disk('public')
                    ->height(48)
                    ->square(),

                Tables\Columns\TextColumn::make('name')
                    ->label('Nom')
                    ->searchable()
                    ->sortable()
                    ->description(fn (Product $r) => $r->category?->name),

                Tables\Columns\TextColumn::make('base_price')
                    ->label('Prix détail')
                    ->money('XAF')
                    ->sortable(),

                Tables\Columns\TextColumn::make('wholesale_price')
                    ->label('Prix gros')
                    ->money('XAF')
                    ->placeholder('—')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('promo_price')
                    ->label('Promo détail')
                    ->money('XAF')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('promo_wholesale_price')
                    ->label('Promo gros')
                    ->money('XAF')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('variants_sum_stock')
                    ->label('Stock')
                    ->sum('variants', 'stock')
                    ->badge()
                    ->color(fn ($state) => $state > 0 ? 'success' : 'danger')
                    ->formatStateUsing(fn ($state) => ($state ?? 0).' u.'),

                Tables\Columns\IconColumn::make('is_new')
                    ->label('Nouveau')
                    ->boolean(),

                Tables\Columns\IconColumn::make('show_in_catalog')
                    ->label('Dans la boutique')
                    ->boolean()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (ProductStatus $state) => $state->label())
                    ->color(fn (ProductStatus $state) => match ($state) {
                        ProductStatus::Active => 'success',
                        ProductStatus::Draft => 'gray',
                        ProductStatus::Archived => 'warning',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options(collect(ProductStatus::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()])),
                Tables\Filters\SelectFilter::make('category_id')
                    ->label('Catégorie')
                    ->relationship('category', 'name'),
                Tables\Filters\TernaryFilter::make('is_new')->label('Nouveautés'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\VariantsRelationManager::class,
            RelationManagers\MediaRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
