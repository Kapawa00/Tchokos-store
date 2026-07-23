<?php

namespace App\Providers;

use App\Http\Responses\Auth\AdminLogoutResponse;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\User;
use App\Models\Variant;
use App\Models\WholesaleAccount;
use App\Observers\CategoryObserver;
use App\Observers\MediaObserver;
use App\Observers\ProductObserver;
use App\Observers\PromotionObserver;
use App\Observers\VariantObserver;
use App\Observers\WholesaleAccountObserver;
use Filament\Http\Responses\Auth\Contracts\LogoutResponse;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Minishlink\WebPush\WebPush;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(WebPush::class, function () {
            // VAPID::validate() (appelée par le constructeur dès qu'on lui
            // passe une clé 'VAPID') lève une \ErrorException si publicKey/
            // privateKey sont absentes — ce qui arrive tant que les vraies
            // clés VAPID ne sont pas configurées en prod. Sans cette garde,
            // la première commande qui déclenche une notification push
            // admin fait planter OrderCreated::dispatch() avant même que
            // SendOrderCreatedNotifications::handle() ne s'exécute (donc
            // avant ses propres try/catch), transformant une commande
            // pourtant bien enregistrée en 500 côté client.
            $publicKey = config('webpush.vapid.public_key');
            $privateKey = config('webpush.vapid.private_key');

            $auth = ($publicKey && $privateKey)
                ? ['VAPID' => [
                    'subject' => config('webpush.vapid.subject'),
                    'publicKey' => $publicKey,
                    'privateKey' => $privateKey,
                ]]
                : [];

            return new WebPush($auth);
        });

        // Un seul écran de connexion (vitrine) : après déconnexion du panneau
        // Filament, on renvoie vers /compte/connexion plutôt que la page de
        // login par défaut de Filament (/admin/login).
        $this->app->bind(LogoutResponse::class, AdminLogoutResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force toutes les URLs générées (redirections, assets, liens Filament)
        // à utiliser APP_URL. Indispensable quand le backend est derrière un
        // proxy (Next.js en dev, nginx en prod) qui expose un port différent.
        URL::forceRootUrl(config('app.url'));

        // Redirige vers le frontend plutôt que /password/reset de Laravel.
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontend = env('FRONTEND_URL', 'http://localhost:3000');

            return $frontend
                .'/compte/reinitialiser-mot-de-passe?token='
                .$token
                .'&email='
                .urlencode($notifiable->getEmailForPasswordReset());
        });

        // Un grossiste ne voit le prix de gros qu'une fois son wholesale_account approuvé.
        Gate::define('viewWholesalePrice', fn (User $user) => $user->isApprovedWholesaler());

        WholesaleAccount::observe(WholesaleAccountObserver::class);
        Variant::observe(VariantObserver::class);

        // Invalide le cache ISR du frontend dès qu'une ressource du
        // catalogue change dans l'admin (cf. App\Services\FrontendRevalidator).
        Product::observe(ProductObserver::class);
        Category::observe(CategoryObserver::class);
        Media::observe(MediaObserver::class);
        Promotion::observe(PromotionObserver::class);

        // App\Events\OrderCreated, OrderStatusUpdated et ProductBackInStock
        // sont câblés automatiquement par la découverte d'événements de
        // Laravel 11 (les listeners dans app/Listeners ont un handle()
        // typé sur l'événement) : pas d'Event::listen() explicite ici, sous
        // peine de déclencher chaque listener deux fois.
    }
}
