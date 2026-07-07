<?php

namespace App\Filament\Resources;

use App\Enums\MediaType;
use App\Filament\Resources\MediaResource\Pages;
use App\Models\Media;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MediaResource extends Resource
{
    protected static ?string $model = Media::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationGroup = 'Catalogue';

    protected static ?int $navigationSort = 4;

    protected static ?string $modelLabel = 'média';

    protected static ?string $pluralModelLabel = 'médias';

    protected static ?string $navigationLabel = 'Médiathèque';

    public static function form(Form $form): Form
    {
        return $form->columns(2)->schema([
            Forms\Components\Select::make('product_id')
                ->label('Produit')
                ->relationship('product', 'name')
                ->searchable()
                ->preload()
                ->required(),
            Forms\Components\Select::make('type')
                ->label('Type')
                ->options([
                    MediaType::Video->value => 'Vidéo (reel)',
                    MediaType::Image->value => 'Image',
                ])
                ->live()
                ->required(),
            Forms\Components\FileUpload::make('url')
                ->label('Fichier')
                ->disk('public')
                ->directory('produits/medias')
                // Limité à 37 Mo : reste sous upload_max_filesize/post_max_size (40M) de php.ini.
                ->maxSize(38000)
                ->required()
                ->columnSpanFull(),
            Forms\Components\FileUpload::make('poster_url')
                ->label('Vignette (poster vidéo)')
                ->image()
                ->disk('public')
                ->directory('produits/posters')
                ->visible(fn (Forms\Get $get) => $get('type') === MediaType::Video->value)
                ->columnSpanFull(),
            Forms\Components\TextInput::make('position')->label('Ordre dans le produit')->numeric()->default(0),
            Forms\Components\Toggle::make('is_featured_reel')->label('Dans le mur de reels'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('preview')
                    ->label('Aperçu')
                    ->disk('public')
                    ->height(56)
                    ->state(fn (Media $r) => $r->type === MediaType::Video ? $r->poster_url : $r->url),
                Tables\Columns\TextColumn::make('product.name')->label('Produit')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (MediaType $state) => $state === MediaType::Video ? 'Vidéo' : 'Image')
                    ->color(fn (MediaType $state) => $state === MediaType::Video ? 'warning' : 'gray'),
                Tables\Columns\IconColumn::make('is_featured_reel')->label('Reel')->boolean(),
                Tables\Columns\TextColumn::make('position')->label('Ordre')->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Type')
                    ->options([
                        MediaType::Video->value => 'Vidéo',
                        MediaType::Image->value => 'Image',
                    ]),
                Tables\Filters\TernaryFilter::make('is_featured_reel')->label('Mur de reels'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMedia::route('/'),
            'create' => Pages\CreateMedia::route('/create'),
            'edit' => Pages\EditMedia::route('/{record}/edit'),
        ];
    }
}
