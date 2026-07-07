<?php

namespace App\Models;

use App\Notifications\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use App\Enums\WholesaleStatus;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser, MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    public function wholesaleAccount(): HasOne
    {
        return $this->hasOne(WholesaleAccount::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    /**
     * Surcharge volontaire de la relation `notifications()` fournie par le
     * trait Notifiable : ce projet utilise sa propre table `notifications`
     * (user_id, channel, type, payload, read_at) plutôt que le schéma
     * polymorphique par défaut de Laravel (notifiable_type/notifiable_id).
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->latest();
    }

    /**
     * Un grossiste ne doit voir le prix de gros qu'une fois son
     * wholesale_account approuvé par un administrateur/gestionnaire.
     */
    public function isApprovedWholesaler(): bool
    {
        return $this->role === UserRole::Wholesaler
            && $this->wholesaleAccount?->status === WholesaleStatus::Approved;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isManager(): bool
    {
        return $this->role === UserRole::Manager;
    }

    /**
     * Membre du personnel autorisé à ouvrir le back-office (admin ou gestionnaire).
     */
    public function isStaff(): bool
    {
        return in_array($this->role, [UserRole::Admin, UserRole::Manager], true);
    }

    /**
     * Filament : seuls les administrateurs et gestionnaires accèdent à /admin.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->isStaff();
    }

    /** Utilise notre notification personnalisée (email en français). */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification);
    }
}
