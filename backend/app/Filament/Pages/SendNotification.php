<?php

namespace App\Filament\Pages;

use App\Enums\NotificationChannel;
use App\Enums\UserRole;
use App\Enums\WholesaleStatus;
use App\Models\Notification as NotificationModel;
use App\Models\PushSubscription;
use App\Models\User;
use App\Notifications\BroadcastMail;
use App\Services\PushNotifier;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

/**
 * « Envoyer une notification » : diffuse un message (push ou e-mail) à un
 * segment de clients (promo, nouveauté). Réservé aux administrateurs.
 */
class SendNotification extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-megaphone';

    protected static ?string $navigationGroup = 'Communication';

    protected static ?string $navigationLabel = 'Envoyer une notification';

    protected static ?string $title = 'Envoyer une notification';

    protected static string $view = 'filament.pages.send-notification';

    public ?array $data = [];

    public static function canAccess(): bool
    {
        // Diffusion de masse = réglage sensible : administrateurs uniquement.
        return Auth::user()?->isAdmin() ?? false;
    }

    public function mount(): void
    {
        $this->form->fill([
            'channel' => NotificationChannel::Push->value,
            'segment' => 'customers',
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Destinataires & canal')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('segment')
                            ->label('Segment de clients')
                            ->options([
                                'customers' => 'Tous les clients',
                                'wholesalers' => 'Grossistes approuvés',
                                'push_subscribers' => 'Abonnés aux notifications push',
                                'all' => 'Tous les comptes',
                            ])
                            ->required(),
                        Forms\Components\Select::make('channel')
                            ->label('Canal')
                            ->options([
                                NotificationChannel::Push->value => 'Notification push',
                                NotificationChannel::Email->value => 'E-mail',
                            ])
                            ->required(),
                    ]),
                Forms\Components\Section::make('Message')
                    ->schema([
                        Forms\Components\TextInput::make('title')->label('Titre')->required()->maxLength(120),
                        Forms\Components\Textarea::make('body')->label('Message')->required()->rows(4),
                        Forms\Components\TextInput::make('link')->label('Lien (optionnel)')->url(),
                    ]),
            ])
            ->statePath('data');
    }

    public function send(PushNotifier $pushNotifier): void
    {
        $state = $this->form->getState();

        $channel = NotificationChannel::from($state['channel']);
        $recipients = $this->resolveRecipients($state['segment']);

        if ($recipients->isEmpty()) {
            Notification::make()->title('Aucun destinataire pour ce segment')->warning()->send();

            return;
        }

        $data = ['url' => $state['link'] ?? null];

        if ($channel === NotificationChannel::Push) {
            foreach ($recipients as $user) {
                $pushNotifier->notifyUser($user, $state['title'], $state['body'], $data);
            }
        } else {
            foreach ($recipients as $user) {
                if ($user->email) {
                    Mail::to($user->email)->queue(new BroadcastMail($state['title'], $state['body'], $state['link'] ?? null));
                }
            }
        }

        // Trace en base (table notifications) pour l'historique côté client.
        $rows = $recipients->map(fn (User $u) => [
            'user_id' => $u->id,
            'channel' => $channel->value,
            'type' => 'broadcast',
            'payload' => json_encode(['title' => $state['title'], 'body' => $state['body'], 'data' => $data]),
            'created_at' => now(),
            'updated_at' => now(),
        ])->all();

        NotificationModel::insert($rows);

        Notification::make()
            ->title('Notification envoyée')
            ->body($recipients->count().' destinataire(s) — canal : '.($channel === NotificationChannel::Push ? 'push' : 'e-mail').'.')
            ->success()
            ->send();
    }

    /**
     * @return Collection<int, User>
     */
    private function resolveRecipients(string $segment): Collection
    {
        return match ($segment) {
            'customers' => User::where('role', UserRole::Customer)->get(),
            'wholesalers' => User::where('role', UserRole::Wholesaler)
                ->whereHas('wholesaleAccount', fn ($q) => $q->where('status', WholesaleStatus::Approved))
                ->get(),
            'push_subscribers' => User::whereIn('id', PushSubscription::query()->distinct()->pluck('user_id')->filter())->get(),
            default => User::all(),
        };
    }
}
