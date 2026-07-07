<?php

namespace App\Filament\Resources;

use App\Enums\WholesaleStatus;
use App\Filament\Resources\WholesaleAccountResource\Pages;
use App\Models\WholesaleAccount;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WholesaleAccountResource extends Resource
{
    protected static ?string $model = WholesaleAccount::class;

    protected static ?string $navigationIcon = 'heroicon-o-briefcase';

    protected static ?string $navigationGroup = 'Clients';

    protected static ?int $navigationSort = 2;

    protected static ?string $modelLabel = 'demande grossiste';

    protected static ?string $pluralModelLabel = 'demandes grossistes';

    protected static ?string $navigationLabel = 'Demandes grossistes';

    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::where('status', WholesaleStatus::Pending)->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form->columns(2)->schema([
            Forms\Components\Select::make('user_id')
                ->label('Compte client')
                ->relationship('user', 'name')
                ->searchable()
                ->disabled(),
            Forms\Components\Select::make('status')
                ->label('Statut')
                ->options(collect(WholesaleStatus::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()]))
                ->required(),
            Forms\Components\TextInput::make('company')->label('Société'),
            Forms\Components\TextInput::make('city')->label('Ville'),
            Forms\Components\TextInput::make('item_type')->label('Type d\'articles visés'),
            Forms\Components\TextInput::make('volume')->label('Volume estimé'),
            Forms\Components\Textarea::make('notes')->label('Notes')->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('Client')->searchable(),
                Tables\Columns\TextColumn::make('company')->label('Société')->placeholder('—')->searchable(),
                Tables\Columns\TextColumn::make('city')->label('Ville')->placeholder('—'),
                Tables\Columns\TextColumn::make('item_type')->label('Articles')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('volume')->label('Volume')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (WholesaleStatus $state) => $state->label())
                    ->color(fn (WholesaleStatus $state) => match ($state) {
                        WholesaleStatus::Pending => 'warning',
                        WholesaleStatus::Approved => 'success',
                        WholesaleStatus::Rejected => 'danger',
                    }),
                Tables\Columns\TextColumn::make('created_at')->label('Demandé le')->date('d/m/Y')->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options(collect(WholesaleStatus::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()])),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Approuver')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (WholesaleAccount $r) => $r->status !== WholesaleStatus::Approved)
                    ->action(function (WholesaleAccount $r) {
                        $r->update(['status' => WholesaleStatus::Approved]);
                        Notification::make()->title('Demande approuvée')->success()->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Refuser')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (WholesaleAccount $r) => $r->status !== WholesaleStatus::Rejected)
                    ->action(function (WholesaleAccount $r) {
                        $r->update(['status' => WholesaleStatus::Rejected]);
                        Notification::make()->title('Demande refusée')->warning()->send();
                    }),
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWholesaleAccounts::route('/'),
            'edit' => Pages\EditWholesaleAccount::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
