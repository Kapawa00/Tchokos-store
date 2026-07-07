<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Enums\WholesaleStatus;
use App\Filament\Concerns\HasDateRangeFilter;
use App\Models\Order;
use App\Models\User;
use App\Models\Variant;
use App\Models\WholesaleAccount;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class StatsOverviewWidget extends BaseWidget
{
    use HasDateRangeFilter;

    protected static ?int $sort = 1;

    // Rafraîchissement automatique toutes les 30 secondes.
    protected static ?string $pollingInterval = '30s';

    // Pleine largeur sur toutes les tailles.
    protected int|string|array $columnSpan = 'full';

    /** @var array<string, mixed>|null Injectés par Filament depuis la page Dashboard. */
    public ?array $filters = null;

    protected function getStats(): array
    {
        [$from, $to]         = $this->getDateRange();
        [$prevFrom, $prevTo] = $this->getPreviousDateRange();

        $paidStatuses = [
            OrderStatus::Paid,
            OrderStatus::Preparing,
            OrderStatus::Shipped,
            OrderStatus::Delivered,
        ];

        $cacheKey = 'dashboard.stats.' . md5(serialize($this->filters));

        return Cache::remember($cacheKey, 60, function () use ($from, $to, $prevFrom, $prevTo, $paidStatuses) {

            // ── Chiffre d'affaires ──────────────────────────────────────────
            $revenue     = (float) Order::whereIn('status', $paidStatuses)->whereBetween('created_at', [$from, $to])->sum('total');
            $prevRevenue = (float) Order::whereIn('status', $paidStatuses)->whereBetween('created_at', [$prevFrom, $prevTo])->sum('total');

            // ── Commandes ───────────────────────────────────────────────────
            $orders     = Order::whereBetween('created_at', [$from, $to])->count();
            $prevOrders = Order::whereBetween('created_at', [$prevFrom, $prevTo])->count();

            // ── Panier moyen ────────────────────────────────────────────────
            $avgBasket     = (float) (Order::whereIn('status', $paidStatuses)->whereBetween('created_at', [$from, $to])->avg('total') ?? 0);
            $prevAvgBasket = (float) (Order::whereIn('status', $paidStatuses)->whereBetween('created_at', [$prevFrom, $prevTo])->avg('total') ?? 0);

            // ── Nouveaux clients ────────────────────────────────────────────
            $newClients     = User::where('role', UserRole::Customer)->whereBetween('created_at', [$from, $to])->count();
            $prevNewClients = User::where('role', UserRole::Customer)->whereBetween('created_at', [$prevFrom, $prevTo])->count();

            // ── En attente de paiement (global, pas filtré par date) ────────
            $pendingPayment = Order::where('status', OrderStatus::PendingPayment)->count();

            // ── À préparer / à expédier (global) ───────────────────────────
            $toProcess = Order::whereIn('status', [OrderStatus::Paid, OrderStatus::Preparing])->count();

            // ── Stock faible (global) ────────────────────────────────────────
            $threshold = (int) config('shop.low_stock_threshold', 5);
            $lowStock  = Variant::where('stock', '<=', $threshold)->count();

            // ── Demandes grossistes en attente (global) ─────────────────────
            $pendingWholesale = WholesaleAccount::where('status', WholesaleStatus::Pending)->count();

            return [
                Stat::make('Chiffre d\'affaires', $this->fcfa($revenue))
                    ->description('vs période préc. : ' . $this->variation($revenue, $prevRevenue))
                    ->descriptionIcon($revenue >= $prevRevenue ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                    ->color($this->variationColor($revenue, $prevRevenue))
                    ->chart($this->revenueSparkline($from, $to, $paidStatuses)),

                Stat::make('Commandes', (string) $orders)
                    ->description('vs période préc. : ' . $this->variation((float) $orders, (float) $prevOrders))
                    ->descriptionIcon('heroicon-m-clipboard-document-list')
                    ->color($this->variationColor((float) $orders, (float) $prevOrders)),

                Stat::make('Panier moyen', $this->fcfa($avgBasket))
                    ->description('vs période préc. : ' . $this->variation($avgBasket, $prevAvgBasket))
                    ->descriptionIcon('heroicon-m-shopping-cart')
                    ->color($this->variationColor($avgBasket, $prevAvgBasket)),

                Stat::make('Nouveaux clients', (string) $newClients)
                    ->description('vs période préc. : ' . $this->variation((float) $newClients, (float) $prevNewClients))
                    ->descriptionIcon('heroicon-m-user-plus')
                    ->color($this->variationColor((float) $newClients, (float) $prevNewClients)),

                Stat::make('En attente de paiement', (string) $pendingPayment)
                    ->description('Commandes à valider')
                    ->descriptionIcon('heroicon-m-clock')
                    ->color($pendingPayment > 0 ? 'warning' : 'success'),

                Stat::make('À préparer / expédier', (string) $toProcess)
                    ->description('Payées ou en préparation')
                    ->descriptionIcon('heroicon-m-archive-box')
                    ->color($toProcess > 0 ? 'info' : 'success'),

                Stat::make('Stock faible', (string) $lowStock)
                    ->description('Seuil ≤ ' . $threshold . ' unités')
                    ->descriptionIcon('heroicon-m-exclamation-triangle')
                    ->color($lowStock > 0 ? 'danger' : 'success'),

                Stat::make('Demandes grossistes', (string) $pendingWholesale)
                    ->description('En attente d\'approbation')
                    ->descriptionIcon('heroicon-m-building-storefront')
                    ->color($pendingWholesale > 0 ? 'warning' : 'gray'),
            ];
        });
    }

    /** Mini-graphique de tendance du CA sur la période sélectionnée. */
    private function revenueSparkline(\Carbon\Carbon $from, \Carbon\Carbon $to, array $statuses): array
    {
        return Order::whereIn('status', $statuses)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as d, SUM(total) as total')
            ->groupBy('d')
            ->orderBy('d')
            ->pluck('total')
            ->map(fn ($v) => (float) $v)
            ->toArray();
    }
}
