<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BannerResource\Pages;
use App\Models\Banner;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BannerResource extends Resource
{
    protected static ?string $model = Banner::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-group';

    protected static ?string $navigationGroup = 'Accueil';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'bannière';

    protected static ?string $pluralModelLabel = 'bannières';

    protected static ?string $navigationLabel = 'Bannières d\'accueil';

    public static function form(Form $form): Form
    {
        return $form->columns(2)->schema([
            Forms\Components\TextInput::make('title')->label('Titre')->required(),
            Forms\Components\TextInput::make('subtitle')->label('Sous-titre'),
            Forms\Components\TextInput::make('link_url')->label('Lien (URL au clic)')->url(),
            Forms\Components\TextInput::make('position')->label('Ordre')->numeric()->default(0)->required(),
            Forms\Components\Toggle::make('active')->label('Active')->default(true),
            Forms\Components\FileUpload::make('image_url')
                ->label('Image de la bannière')
                ->image()
                ->disk('public')
                ->directory('bannieres')
                ->imageEditor()
                ->maxSize(5120)
                ->required()
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('position')
            ->defaultSort('position')
            ->columns([
                Tables\Columns\ImageColumn::make('image_url')->label('Visuel')->disk('public')->height(48),
                Tables\Columns\TextColumn::make('title')->label('Titre')->searchable(),
                Tables\Columns\TextColumn::make('subtitle')->label('Sous-titre')->placeholder('—')->limit(40),
                Tables\Columns\IconColumn::make('active')->label('Active')->boolean(),
                Tables\Columns\TextColumn::make('position')->label('Ordre')->sortable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListBanners::route('/'),
            'create' => Pages\CreateBanner::route('/create'),
            'edit' => Pages\EditBanner::route('/{record}/edit'),
        ];
    }
}
