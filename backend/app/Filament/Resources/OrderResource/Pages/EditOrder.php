<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Enums\OrderStatus;
use App\Enums\TransactionStatus;
use App\Filament\Resources\OrderResource;
use App\Models\Order;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('validatePayment')
                ->label('Valider le paiement')
                ->icon('heroicon-o-check-badge')
                ->color('success')
                ->requiresConfirmation()
                ->modalDescription('Confirmez-vous avoir reçu et vérifié le paiement ?')
                ->visible(fn (Order $record) => $record->status === OrderStatus::PendingPayment)
                ->action(function (Order $record) {
                    if ($tx = $record->transaction) {
                        $tx->update(['status' => TransactionStatus::Confirmed]);
                    }
                    $record->update(['status' => OrderStatus::Paid]);

                    Notification::make()->title('Paiement validé')->success()->send();

                    $this->refreshFormData(['status']);
                }),
        ];
    }
}
