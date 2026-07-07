<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Enums\OrderStatus;
use App\Filament\Resources\OrderResource;
use Filament\Resources\Components\Tab;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Database\Eloquent\Builder;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    /**
     * Onglets de tri rapide par statut (toutes, à payer, payées, à expédier…).
     */
    public function getTabs(): array
    {
        return [
            'all' => Tab::make('Toutes'),
            'to_pay' => Tab::make('À encaisser')
                ->modifyQueryUsing(fn (Builder $q) => $q->where('status', OrderStatus::PendingPayment))
                ->badgeColor('warning'),
            'paid' => Tab::make('Payées')
                ->modifyQueryUsing(fn (Builder $q) => $q->where('status', OrderStatus::Paid)),
            'preparing' => Tab::make('En préparation')
                ->modifyQueryUsing(fn (Builder $q) => $q->where('status', OrderStatus::Preparing)),
            'shipped' => Tab::make('Expédiées')
                ->modifyQueryUsing(fn (Builder $q) => $q->where('status', OrderStatus::Shipped)),
            'delivered' => Tab::make('Livrées')
                ->modifyQueryUsing(fn (Builder $q) => $q->where('status', OrderStatus::Delivered)),
        ];
    }
}
