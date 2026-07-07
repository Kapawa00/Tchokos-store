<?php

namespace App\Filament\Widgets;

use App\Enums\WholesaleStatus;
use App\Models\WholesaleAccount;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class PendingWholesaleWidget extends BaseWidget
{
    protected static ?string $heading = 'Demandes de compte grossiste';
    protected static ?int    $sort    = 12;

    protected int|string|array $columnSpan = 2;

    public function table(Table $table): Table
    {
        return $table
            ->query(WholesaleAccount::with('user')->where('status', WholesaleStatus::Pending)->latest())
            ->paginated([5, 10])
            ->defaultPaginationPageOption(5)
            ->columns([
                Tables\Columns\TextColumn::make('company')
                    ->label('Société / Nom')
                    ->description(fn (WholesaleAccount $r) => $r->user?->name ?? '—'),

                Tables\Columns\TextColumn::make('city')
                    ->label('Ville'),

                Tables\Columns\TextColumn::make('item_type')
                    ->label('Type'),

                Tables\Columns\TextColumn::make('volume')
                    ->label('Volume estimé'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Soumis le')
                    ->dateTime('d/m/Y'),
            ])
            ->actions([
                Action::make('approve')
                    ->label('Approuver')
                    ->icon('heroicon-m-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Approuver cette demande ?')
                    ->action(function (WholesaleAccount $record): void {
                        $record->update(['status' => WholesaleStatus::Approved]);
                        \Filament\Notifications\Notification::make()
                            ->title('Compte grossiste approuvé')
                            ->success()
                            ->send();
                    }),

                Action::make('reject')
                    ->label('Refuser')
                    ->icon('heroicon-m-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Refuser cette demande ?')
                    ->action(function (WholesaleAccount $record): void {
                        $record->update(['status' => WholesaleStatus::Rejected]);
                        \Filament\Notifications\Notification::make()
                            ->title('Demande refusée')
                            ->warning()
                            ->send();
                    }),
            ])
            ->emptyStateHeading('Aucune demande en attente')
            ->emptyStateIcon('heroicon-o-building-storefront');
    }
}
