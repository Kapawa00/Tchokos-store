<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Filament\Resources\OrderResource;
use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;

class RecentOrdersWidget extends BaseWidget
{
    protected static ?string $heading = 'Dernières commandes';
    protected static ?int    $sort    = 10;

    // Rafraîchissement toutes les 30 secondes.
    protected static ?string $pollingInterval = '30s';

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::with(['user'])->latest()->limit(10))
            ->paginated(false)
            ->columns([
                Tables\Columns\TextColumn::make('reference')
                    ->label('Référence')
                    ->searchable()
                    ->weight('bold')
                    ->url(fn (Order $o) => OrderResource::getUrl('edit', ['record' => $o])),

                Tables\Columns\TextColumn::make('customer_name')
                    ->label('Client')
                    ->description(fn (Order $o) => $o->user?->email ?? $o->customer_email ?? '—'),

                Tables\Columns\TextColumn::make('channel')
                    ->label('Canal')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state?->value ?? $state) {
                        'whatsapp' => 'WhatsApp',
                        'email'    => 'E-mail',
                        'site'     => 'Site',
                        default    => $state?->value ?? $state,
                    })
                    ->color(fn ($state) => match ($state?->value ?? $state) {
                        'whatsapp' => 'success',
                        'email'    => 'info',
                        'site'     => 'primary',
                        default    => 'gray',
                    }),

                Tables\Columns\TextColumn::make('total')
                    ->label('Montant')
                    ->formatStateUsing(fn ($state) => number_format((float) $state, 0, ',', ' ') . ' FCFA')
                    ->weight('semibold'),

                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn ($state) => $state instanceof OrderStatus ? $state->label() : $state)
                    ->color(fn ($state) => match ($state instanceof OrderStatus ? $state->value : $state) {
                        'pending_payment' => 'warning',
                        'paid'            => 'success',
                        'preparing'       => 'info',
                        'shipped'         => 'primary',
                        'delivered'       => 'gray',
                        'cancelled'       => 'danger',
                        default           => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->actions([
                Action::make('change_status')
                    ->label('Changer le statut')
                    ->icon('heroicon-m-arrow-path')
                    ->form([
                        \Filament\Forms\Components\Select::make('status')
                            ->label('Nouveau statut')
                            ->options(
                                collect(OrderStatus::cases())
                                    ->mapWithKeys(fn ($s) => [$s->value => $s->label()])
                            )
                            ->required(),
                    ])
                    ->action(function (Order $record, array $data): void {
                        $record->update(['status' => $data['status']]);
                        \Filament\Notifications\Notification::make()
                            ->title('Statut mis à jour')
                            ->success()
                            ->send();
                    }),

                Action::make('validate_payment')
                    ->label('Valider paiement')
                    ->icon('heroicon-m-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Valider ce paiement WhatsApp ?')
                    ->modalDescription('Cette action marque la commande comme payée.')
                    ->visible(fn (Order $o) => $o->status === OrderStatus::PendingPayment)
                    ->action(function (Order $record): void {
                        $record->update(['status' => OrderStatus::Paid->value]);
                        \Filament\Notifications\Notification::make()
                            ->title('Paiement validé — commande ' . $record->reference)
                            ->success()
                            ->send();
                    }),

                Tables\Actions\ViewAction::make()
                    ->url(fn (Order $o) => OrderResource::getUrl('edit', ['record' => $o])),
            ])
            ->emptyStateHeading('Aucune commande')
            ->emptyStateIcon('heroicon-o-clipboard-document-list');
    }
}
