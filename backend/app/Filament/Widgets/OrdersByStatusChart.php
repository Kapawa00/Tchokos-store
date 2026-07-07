<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Filament\Concerns\HasDateRangeFilter;
use App\Models\Order;
use Filament\Widgets\ChartWidget;

class OrdersByStatusChart extends ChartWidget
{
    use HasDateRangeFilter;

    protected static ?string $heading = 'Commandes par statut';
    protected static ?int    $sort    = 3;

    protected int|string|array $columnSpan = 1;

    /** @var array<string, mixed>|null */
    public ?array $filters = null;

    protected function getData(): array
    {
        [$from, $to] = $this->getDateRange();

        $counts = Order::whereBetween('created_at', [$from, $to])
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // Couleurs charte par statut
        $colorMap = [
            OrderStatus::PendingPayment->value => '#C89B6A', // camel
            OrderStatus::Paid->value           => '#5B6B57', // sage
            OrderStatus::Preparing->value      => '#9C6B3F', // cognac
            OrderStatus::Shipped->value        => '#B89A5E', // brass
            OrderStatus::Delivered->value      => '#2A211B', // espresso
            OrderStatus::Cancelled->value      => '#7A3B3B', // bordeaux
        ];

        $labels = [];
        $values = [];
        $colors = [];

        foreach (OrderStatus::cases() as $status) {
            $labels[] = $status->label();
            $values[] = (int) ($counts[$status->value] ?? 0);
            $colors[] = $colorMap[$status->value];
        }

        return [
            'datasets' => [[
                'data'            => $values,
                'backgroundColor' => $colors,
                'hoverOffset'     => 6,
            ]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => ['position' => 'bottom'],
            ],
        ];
    }
}
