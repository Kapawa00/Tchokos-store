<?php

namespace App\Filament\Resources;

use App\Enums\CategoryType;
use App\Filament\Resources\CategoryResource\Pages;
use App\Models\Category;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationGroup = 'Catalogue';

    protected static ?int $navigationSort = 2;

    protected static ?string $modelLabel = 'catégorie';

    protected static ?string $pluralModelLabel = 'catégories';

    protected static ?string $navigationLabel = 'Catégories';

    public static function form(Form $form): Form
    {
        return $form->columns(2)->schema([
            Forms\Components\TextInput::make('name')
                ->label('Nom')
                ->required()
                ->live(onBlur: true)
                ->afterStateUpdated(function (Forms\Set $set, ?string $state, Forms\Get $get) {
                    if (blank($get('slug'))) {
                        $set('slug', Str::slug((string) $state));
                    }
                }),

            Forms\Components\TextInput::make('slug')
                ->label('Slug (URL)')
                ->helperText('Laisser vide pour générer automatiquement.')
                ->unique(ignoreRecord: true),

            Forms\Components\Select::make('type')
                ->label('Type')
                ->options([
                    CategoryType::Family->value => 'Famille (ex. Chaussures, Sacs)',
                    CategoryType::Section->value => 'Rayon (ex. Hommes, Femmes, Enfants)',
                ])
                ->required(),

            Forms\Components\Select::make('parent_id')
                ->label('Catégorie parente')
                ->relationship('parent', 'name')
                ->searchable()
                ->preload()
                ->placeholder('Aucune (catégorie racine)'),

            Forms\Components\TextInput::make('position')
                ->label('Ordre d\'affichage')
                ->numeric()
                ->default(0),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('position')
            ->defaultSort('position')
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('Nom')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (CategoryType $state) => $state->label()),
                Tables\Columns\TextColumn::make('parent.name')->label('Parente')->placeholder('—'),
                Tables\Columns\TextColumn::make('products_count')->counts('products')->label('Produits'),
                Tables\Columns\TextColumn::make('position')->label('Ordre')->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Type')
                    ->options(collect(CategoryType::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()])),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->before(function (Tables\Actions\DeleteAction $action, Category $record) {
                        if ($record->products()->exists()) {
                            Notification::make()
                                ->danger()
                                ->title('Suppression impossible')
                                ->body("La catégorie « {$record->name} » contient encore des produits. Réaffectez-les à une autre catégorie avant de la supprimer.")
                                ->send();

                            $action->halt();
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->before(function (Tables\Actions\DeleteBulkAction $action, \Illuminate\Support\Collection $records) {
                            $blocked = $records->filter(fn (Category $category) => $category->products()->exists());

                            if ($blocked->isNotEmpty()) {
                                Notification::make()
                                    ->danger()
                                    ->title('Suppression impossible')
                                    ->body('Ces catégories contiennent encore des produits et n\'ont pas été supprimées : '.$blocked->pluck('name')->join(', '))
                                    ->send();

                                $action->halt();
                            }
                        }),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCategories::route('/'),
            'create' => Pages\CreateCategory::route('/create'),
            'edit' => Pages\EditCategory::route('/{record}/edit'),
        ];
    }
}
