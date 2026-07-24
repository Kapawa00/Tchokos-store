<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Enums\MediaType;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class MediaRelationManager extends RelationManager
{
    protected static string $relationship = 'media';

    protected static ?string $title = 'Médias (vidéos & images)';

    protected static ?string $modelLabel = 'média';

    protected static ?string $pluralModelLabel = 'médias';

    public function form(Form $form): Form
    {
        return $form->columns(2)->schema([
            Forms\Components\Select::make('type')
                ->label('Type')
                ->options([
                    MediaType::Video->value => 'Vidéo (reel)',
                    MediaType::Image->value => 'Image',
                ])
                ->default(MediaType::Image->value)
                ->live()
                ->required(),

            Forms\Components\TextInput::make('position')
                ->label('Ordre d\'affichage')
                ->numeric()
                ->default(0)
                ->required(),

            // Upload de l'image (format portrait 4:5 recommandé, fond clair).
            Forms\Components\FileUpload::make('url')
                ->label('Fichier image')
                ->image()
                ->disk('public')
                ->directory('produits/images')
                ->imageEditor()
                ->imageEditorAspectRatios(['4:5'])
                ->maxSize(5120)
                ->visible(fn (Forms\Get $get) => $get('type') === MediaType::Image->value)
                ->required(fn (Forms\Get $get) => $get('type') === MediaType::Image->value)
                ->columnSpanFull(),

            // Upload de la vidéo (reel) — les vidéos sont mises en avant.
            Forms\Components\FileUpload::make('url')
                ->label('Fichier vidéo')
                ->disk('public')
                ->directory('produits/videos')
                ->acceptedFileTypes(['video/mp4', 'video/webm', 'video/quicktime'])
                // Limité à 37 Mo : reste sous upload_max_filesize/post_max_size (40M) de php.ini.
                ->maxSize(38000)
                ->visible(fn (Forms\Get $get) => $get('type') === MediaType::Video->value)
                ->required(fn (Forms\Get $get) => $get('type') === MediaType::Video->value)
                ->columnSpanFull(),

            Forms\Components\FileUpload::make('poster_url')
                ->label('Vignette de la vidéo (poster)')
                ->image()
                ->disk('public')
                ->directory('produits/posters')
                ->maxSize(5120)
                ->visible(fn (Forms\Get $get) => $get('type') === MediaType::Video->value)
                ->columnSpanFull(),

            Forms\Components\Fieldset::make('Mur de reels (accueil)')
                ->visible(fn (Forms\Get $get) => $get('type') === MediaType::Video->value)
                ->columns(2)
                ->schema([
                    Forms\Components\Toggle::make('is_featured_reel')
                        ->label('Afficher dans le mur de reels')
                        ->helperText('Décoché par défaut : ajouter une vidéo au produit ne l\'affiche pas ailleurs tant que ce n\'est pas activé ici.')
                        ->default(false),
                    Forms\Components\TextInput::make('reel_position')
                        ->label('Position dans le mur')
                        ->numeric(),
                ]),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('url')
            ->reorderable('position')
            ->defaultSort('position')
            ->columns([
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (MediaType $state) => $state === MediaType::Video ? 'Vidéo' : 'Image')
                    ->color(fn (MediaType $state) => $state === MediaType::Video ? 'warning' : 'gray'),

                Tables\Columns\ImageColumn::make('url')
                    ->label('Aperçu')
                    ->disk('public')
                    ->height(56)
                    // Pour une vidéo, afficher le poster plutôt que le fichier vidéo.
                    ->state(fn ($record) => $record->type === MediaType::Video ? $record->poster_url : $record->url),

                Tables\Columns\TextColumn::make('position')->label('Ordre')->sortable(),

                Tables\Columns\IconColumn::make('is_featured_reel')
                    ->label('Mur de reels')
                    ->boolean(),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()->label('Ajouter un média'),
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
