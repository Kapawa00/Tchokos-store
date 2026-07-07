<?php

namespace App\Filament\Resources;

use App\Enums\PromotionType;
use App\Filament\Resources\PromotionResource\Pages;
use App\Models\Promotion;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PromotionResource extends Resource
{
    protected static ?string $model = Promotion::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationGroup = 'Catalogue';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'promotion';

    protected static ?string $pluralModelLabel = 'promotions';

    protected static ?string $navigationLabel = 'Promotions';

    public static function form(Form $form): Form
    {
        return $form->columns(2)->schema([
            Forms\Components\TextInput::make('title')->label('Intitulé')->required()->columnSpanFull(),

            Forms\Components\Select::make('type')
                ->label('Type de remise')
                ->options([
                    PromotionType::Percent->value => 'Pourcentage (%)',
                    PromotionType::Fixed->value => 'Montant fixe (FCFA)',
                ])
                ->default(PromotionType::Percent->value)
                ->live()
                ->required(),

            Forms\Components\TextInput::make('value')
                ->label('Valeur')
                ->numeric()
                ->minValue(0)
                ->required()
                ->suffix(fn (Forms\Get $get) => $get('type') === PromotionType::Percent->value ? '%' : 'FCFA'),

            Forms\Components\DateTimePicker::make('starts_at')->label('Début')->seconds(false),
            Forms\Components\DateTimePicker::make('ends_at')->label('Fin')->seconds(false)->after('starts_at'),

            Forms\Components\Toggle::make('active')->label('Active')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->label('Intitulé')->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (PromotionType $state) => $state === PromotionType::Percent ? 'Pourcentage' : 'Montant fixe'),
                Tables\Columns\TextColumn::make('value')
                    ->label('Valeur')
                    ->formatStateUsing(fn ($state, Promotion $r) => $r->type === PromotionType::Percent
                        ? rtrim(rtrim(number_format((float) $state, 2), '0'), '.').' %'
                        : number_format((float) $state, 0, ',', ' ').' FCFA'),
                Tables\Columns\TextColumn::make('starts_at')->label('Début')->dateTime('d/m/Y H:i')->placeholder('—'),
                Tables\Columns\TextColumn::make('ends_at')->label('Fin')->dateTime('d/m/Y H:i')->placeholder('—'),
                Tables\Columns\IconColumn::make('active')->label('Active')->boolean(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('active')->label('Active'),
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
            'index' => Pages\ListPromotions::route('/'),
            'create' => Pages\CreatePromotion::route('/create'),
            'edit' => Pages\EditPromotion::route('/{record}/edit'),
        ];
    }
}
