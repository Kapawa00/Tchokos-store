<?php

namespace App\Filament\Resources;

use App\Enums\UserRole;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'Clients';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'client';

    protected static ?string $pluralModelLabel = 'clients';

    protected static ?string $navigationLabel = 'Clients';

    /**
     * Gestion des comptes (y compris les rôles) : réservée aux administrateurs.
     */
    public static function canAccess(): bool
    {
        return Auth::user()?->isAdmin() ?? false;
    }

    public static function form(Form $form): Form
    {
        return $form->columns(2)->schema([
            Forms\Components\TextInput::make('name')->label('Nom')->required(),
            Forms\Components\TextInput::make('email')->label('E-mail')->email()->required()->unique(ignoreRecord: true),
            Forms\Components\TextInput::make('phone')->label('Téléphone')->tel(),
            Forms\Components\Select::make('role')
                ->label('Rôle')
                ->options(collect(UserRole::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()]))
                ->required(),
            Forms\Components\TextInput::make('password')
                ->label('Mot de passe')
                ->password()
                ->revealable()
                ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                ->dehydrated(fn ($state) => filled($state))
                ->required(fn (string $operation) => $operation === 'create')
                ->helperText('Laisser vide pour conserver le mot de passe actuel.'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('Nom')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')->label('E-mail')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('phone')->label('Téléphone')->placeholder('—'),
                Tables\Columns\TextColumn::make('role')
                    ->label('Rôle')
                    ->badge()
                    ->formatStateUsing(fn (UserRole $state) => $state->label())
                    ->color(fn (UserRole $state) => match ($state) {
                        UserRole::Admin => 'danger',
                        UserRole::Manager => 'warning',
                        UserRole::Wholesaler => 'info',
                        UserRole::Customer => 'gray',
                    }),
                Tables\Columns\TextColumn::make('orders_count')->counts('orders')->label('Commandes'),
                Tables\Columns\TextColumn::make('created_at')->label('Inscrit le')->date('d/m/Y')->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->label('Rôle')
                    ->options(collect(UserRole::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()])),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
