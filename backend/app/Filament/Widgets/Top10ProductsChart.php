<?php

namespace App\Filament\Widgets;

use App\Filament\Concerns\HasDateRangeFilter;
use App\Models\OrderItem;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;

class Top10ProductsChart extends ChartWidget
{
    use HasDateRangeFilter;

    protected static ?string $heading = 'Top 10 des produits les plus vendus';
    protected static ?int    $sort    = 7;

    protected int|string|array $columnSpan = 'full';

    /** @var array<string, mixed>|null */
    public ?array $filters = null;

    protected function getData(): array
    {
        [$from, $to] = $this->getDateRange();

        $cacheKey = 'dashboard.top10.' . md5(serialize($this->filters));

        $rows = Cache::remember($cacheKey, 120, function () use ($from, $to) {
            return OrderItem::query()
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->whereBetween('orders.created_at', [$from, $to])
                ->whereNotIn('orders.status', ['pending_payment', 'cancelled'])
                ->selectRaw('order_items.product_name, SUM(order_items.quantity) as qty')
                ->groupBy('order_items.product_name')
                ->orderByDesc('qty')
                ->limit(10)
                ->get();
        });

        return [
            'datasets' => [[
                'label'           => 'Quantité vendue',
                'data'            => $rows->pluck('qty')->toArray(),
                'backgroundColor' => '#9C6B3F',  // cognac
                'borderRadius'    => 4,
            ]],
            'labels' => $rows->pluck('product_name')->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'indexAxis' => 'y',   // barres horizontales
            'plugins' => [
                'legend' => ['display' => false],
            ],
            'scales' => [
                'x' => ['ticks' => ['stepSize' => 1]],
            ],
        ];
    }
}
