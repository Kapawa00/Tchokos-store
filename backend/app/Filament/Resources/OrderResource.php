<?php

namespace App\Filament\Resources;

use App\Enums\OrderChannel;
use App\Enums\OrderStatus;
use App\Enums\TransactionStatus;
use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Support\Enums\FontWeight;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\HtmlString;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $navigationGroup = 'Ventes';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'commande';

    protected static ?string $pluralModelLabel = 'commandes';

    protected static ?string $navigationLabel = 'Commandes';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Commande')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('reference')->label('Référence')->disabled(),
                    Forms\Components\TextInput::make('channel')
                        ->label('Canal')
                        ->formatStateUsing(fn (?OrderChannel $state) => $state?->name)
                        ->disabled(),
                    Forms\Components\Select::make('status')
                        ->label('Statut')
                        ->options(collect(OrderStatus::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()]))
                        ->required(),
                ]),

            Forms\Components\Section::make('Client')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('customer_name')->label('Nom')->disabled(),
                    Forms\Components\TextInput::make('customer_phone')->label('Téléphone')->disabled(),
                    Forms\Components\TextInput::make('customer_email')->label('E-mail')->disabled(),
                ]),

            Forms\Components\Section::make('Montants')
                ->columns(3)
                ->schema([
                    Forms\Components\TextInput::make('subtotal')->label('Sous-total')->suffix('FCFA')->disabled(),
                    Forms\Components\TextInput::make('shipping_fee')->label('Livraison')->suffix('FCFA')->disabled(),
                    Forms\Components\TextInput::make('total')->label('Total')->suffix('FCFA')->disabled(),
                ]),

            Forms\Components\Section::make('Paiement')
                ->description('Détails de la transaction et preuve de paiement (WhatsApp).')
                ->schema([
                    Forms\Components\Placeholder::make('transaction_info')
                        ->label('Transaction')
                        ->content(function (?Order $record): HtmlString {
                            $tx = $record?->transaction;
                            if (! $tx) {
                                return new HtmlString('<span class="text-gray-500">Aucune transaction enregistrée.</span>');
                            }

                            return new HtmlString(sprintf(
                                'Moyen : <strong>%s</strong> — Montant : <strong>%s FCFA</strong> — Statut : <strong>%s</strong>',
                                $tx->method?->label() ?? '—',
                                number_format((float) $tx->amount, 0, ',', ' '),
                                $tx->status?->value ?? '—',
                            ));
                        }),

                    Forms\Components\Placeholder::make('proof')
                        ->label('Preuve de paiement')
                        ->content(function (?Order $record): HtmlString {
                            $url = $record?->transaction?->proof_url;
                            if (blank($url)) {
                                return new HtmlString('<span class="text-gray-500">Aucune preuve fournie.</span>');
                            }

                            // proof_url peut être une URL complète ou un chemin sur le disque public.
                            $src = str_starts_with($url, 'http') ? $url : Storage::disk('public')->url($url);

                            return new HtmlString(
                                '<a href="'.e($src).'" target="_blank" rel="noopener">'
                                .'<img src="'.e($src).'" alt="Preuve" style="max-height:280px;border-radius:8px" /></a>'
                            );
                        }),
                ]),

            Forms\Components\Textarea::make('notes')->label('Notes internes')->rows(3)->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reference')
                    ->label('Référence')
                    ->searchable()
                    ->weight(FontWeight::Bold)
                    ->copyable(),

                Tables\Columns\TextColumn::make('customer_name')
                    ->label('Client')
                    ->description(fn (Order $r) => $r->customer_phone)
                    ->searchable(),

                Tables\Columns\TextColumn::make('channel')
                    ->label('Canal')
                    ->badge()
                    ->formatStateUsing(fn (OrderChannel $state) => match ($state) {
                        OrderChannel::Whatsapp => 'WhatsApp',
                        OrderChannel::Email => 'E-mail',
                        OrderChannel::Site => 'Site',
                    })
                    ->color(fn (OrderChannel $state) => match ($state) {
                        OrderChannel::Whatsapp => 'success',
                        OrderChannel::Email => 'info',
                        OrderChannel::Site => 'gray',
                    }),

                Tables\Columns\TextColumn::make('total')->label('Total')->money('XAF')->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->formatStateUsing(fn (OrderStatus $state) => $state->label())
                    ->color(fn (OrderStatus $state) => match ($state) {
                        OrderStatus::PendingPayment => 'warning',
                        OrderStatus::Paid => 'info',
                        OrderStatus::Preparing => 'primary',
                        OrderStatus::Shipped => 'primary',
                        OrderStatus::Delivered => 'success',
                        OrderStatus::Cancelled => 'danger',
                    }),

                Tables\Columns\TextColumn::make('created_at')->label('Date')->dateTime('d/m/Y H:i')->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Statut')
                    ->options(collect(OrderStatus::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()])),
                Tables\Filters\SelectFilter::make('channel')
                    ->label('Canal')
                    ->options([
                        OrderChannel::Whatsapp->value => 'WhatsApp',
                        OrderChannel::Email->value => 'E-mail',
                        OrderChannel::Site->value => 'Site',
                    ]),
            ])
            ->actions([
                static::validateWhatsappPaymentAction(),
                Tables\Actions\EditAction::make()->label('Détails'),
            ])
            ->defaultSort('created_at', 'desc');
    }

    /**
     * Action « Valider le paiement WhatsApp » : confirme la transaction et passe
     * la commande au statut Payée. Visible seulement pour une commande en attente
     * de paiement réglée par WhatsApp (paiement assisté validé par l'admin).
     */
    public static function validateWhatsappPaymentAction(): Tables\Actions\Action
    {
        return Tables\Actions\Action::make('validatePayment')
            ->label('Valider paiement')
            ->icon('heroicon-o-check-badge')
            ->color('success')
            ->requiresConfirmation()
            ->modalHeading('Valider le paiement WhatsApp')
            ->modalDescription('Confirmez-vous avoir reçu et vérifié le paiement ? La commande passera à « Payée ».')
            ->visible(fn (Order $record) => $record->status === OrderStatus::PendingPayment)
            ->action(function (Order $record) {
                $tx = $record->transaction;
                if ($tx) {
                    $tx->update(['status' => TransactionStatus::Confirmed]);
                }
                $record->update(['status' => OrderStatus::Paid]);

                Notification::make()
                    ->title('Paiement validé')
                    ->body('La commande '.$record->reference.' est marquée comme payée.')
                    ->success()
                    ->send();
            });
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        // Les commandes sont créées via les canaux clients (panier), pas à la main.
        return false;
    }
}
