<?php

namespace App\Providers\Filament;

use App\Filament\Pages\Dashboard;
use App\Http\Middleware\PreventBackHistoryCache;
use App\Http\Middleware\RedirectStaleAdminSessionToStorefront;
use App\Http\Middleware\RedirectUnauthenticatedAdminToStorefront;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\MenuItem;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            // Pas de ->login() : aucune page de connexion propre à Filament.
            // Un seul écran de connexion existe dans toute l'app, celui de la
            // vitrine (/compte/connexion) — cf. AuthController::login() et
            // AdminSsoController pour le pont vers la session Filament.
            ->brandName('Tchokos · Administration')
            ->colors([
                // Cognac (#9C6B3F) : couleur de marque Tchokos (charte « Cuir & Crème »).
                'primary' => Color::hex('#9C6B3F'),
            ])
            ->navigationGroups([
                'Catalogue',
                'Ventes',
                'Clients',
                'Accueil',
                'Communication',
            ])
            ->sidebarCollapsibleOnDesktop()
            ->userMenuItems([
                MenuItem::make()
                    ->label('Retour au site')
                    ->url(config('app.frontend_url'))
                    ->icon('heroicon-o-home'),
            ])
            // Remplace la boîte de dialogue « This page has expired » de
            // Livewire (déclenchée par n'importe quelle requête Livewire —
            // pas seulement le formulaire de déconnexion — recevant un 419)
            // par une redirection directe vers l'écran de connexion unique.
            ->renderHook(
                PanelsRenderHook::BODY_END,
                fn () => view('filament.scripts.handle-session-expiry'),
            )
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                Widgets\AccountWidget::class,
            ])
            ->middleware([
                PreventBackHistoryCache::class,
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                RedirectStaleAdminSessionToStorefront::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                RedirectUnauthenticatedAdminToStorefront::class,
            ]);
    }
}
