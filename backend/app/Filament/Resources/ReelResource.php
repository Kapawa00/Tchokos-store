<?php

namespace App\Filament\Resources;

use App\Enums\MediaType;
use App\Filament\Resources\ReelResource\Pages;
use App\Models\Media;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * « Mur de reels » de l'accueil : vitrine vidéo autonome, indépendante du
 * catalogue — gère la sélection (is_featured_reel) et l'ordre (reel_position)
 * des vidéos mises en avant. S'appuie sur le modèle Media restreint aux
 * vidéos, sans rattachement à un produit (contrairement aux médias ajoutés
 * depuis la fiche produit via MediaRelationManager).
 */
class ReelResource extends Resource
{
    protected static ?string $model = Media::class;

    protected static ?string $navigationIcon = 'heroicon-o-film';

    protected static ?string $navigationGroup = 'Accueil';

    protected static ?int $navigationSort = 2;

    protected static ?string $slug = 'mur-de-reels';

    protected static ?string $modelLabel = 'reel';

    protected static ?string $pluralModelLabel = 'reels';

    protected static ?string $navigationLabel = 'Mur de reels';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('type', MediaType::Video);
    }

    public static function form(Form $form): Form
    {
        return $form->columns(2)->schema([
            Forms\Components\Hidden::make('type')->default(MediaType::Video->value),

            Forms\Components\FileUpload::make('url')
                ->label('Vidéo (reel)')
                ->disk('public')
                ->directory('produits/videos')
                ->acceptedFileTypes(['video/mp4', 'video/webm', 'video/quicktime'])
                // Limité à 37 Mo : reste sous upload_max_filesize/post_max_size (40M) de php.ini.
                ->maxSize(38000)
                ->required()
                ->columnSpanFull(),

            Forms\Components\FileUpload::make('poster_url')
                ->label('Vignette de la vidéo (poster)')
                ->image()
                ->disk('public')
                ->directory('produits/posters')
                ->maxSize(5120)
                ->columnSpanFull(),

            Forms\Components\Toggle::make('is_featured_reel')
                ->label('Afficher dans le mur de reels')
                ->default(true),

            Forms\Components\TextInput::make('reel_position')
                ->label('Position dans le mur')
                ->numeric(),

            Forms\Components\Toggle::make('is_hero')
                ->label('Vidéo héro (fond de l\'accueil)')
                ->helperText('Indépendant du mur de reels : une seule vidéo à la fois peut être héro, activer celle-ci désactive automatiquement l\'ancienne.')
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('reel_position')
            ->defaultSort('reel_position')
            ->columns([
                Tables\Columns\ImageColumn::make('poster_url')->label('Aperçu')->disk('public')->height(64),
                Tables\Columns\ToggleColumn::make('is_featured_reel')->label('Dans le mur'),
                Tables\Columns\TextColumn::make('reel_position')->label('Position')->sortable(),
                Tables\Columns\ToggleColumn::make('is_hero')->label('Héro accueil'),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_featured_reel')
                    ->label('Affichées sur l\'accueil')
                    ->default(true),
            ])
            ->actions([
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReels::route('/'),
            'create' => Pages\CreateReel::route('/create'),
        ];
    }
}
