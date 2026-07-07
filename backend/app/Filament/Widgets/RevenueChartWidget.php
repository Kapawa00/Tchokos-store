<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Filament\Concerns\HasDateRangeFilter;
use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;

class RevenueChartWidget extends ChartWidget
{
    use HasDateRangeFilter;

    protected static ?string $heading = 'Chiffre d\'affaires dans le temps';
    protected static ?int    $sort    = 2;

    protected int|string|array $columnSpan = 2;

    /** @var array<string, mixed>|null */
    public ?array $filters = null;

    protected function getData(): array
    {
        [$from, $to] = $this->getDateRange();
        $granularity = $this->getGranularity();
        $labels      = $this->getPeriodLabels();

        $cacheKey = 'dashboard.revenue_chart.' . md5(serialize($this->filters));

        $data = Cache::remember($cacheKey, 120, function () use ($from, $to, $granularity) {
            $paidStatuses = [
                OrderStatus::Paid, OrderStatus::Preparing,
                OrderStatus::Shipped, OrderStatus::Delivered,
            ];

            if ($granularity === 'day') {
                $format = 'DATE(created_at)';
                $cast   = 'date';
            } else {
                $format = "DATE_FORMAT(created_at, '%Y-%m')";
                $cast   = 'month';
            }

            return Order::whereIn('status', $paidStatuses)
                ->whereBetween('created_at', [$from, $to])
                ->selectRaw("{$format} as period, SUM(total) as total")
                ->groupBy('period')
                ->orderBy('period')
                ->pluck('total', 'period')
                ->toArray();
        });

        // Aligner les données sur les labels (valeur 0 si pas de commande ce jour/mois).
        $values = [];
        foreach ($this->getRawPeriodKeys($from, $to, $granularity) as $key) {
            $values[] = (float) ($data[$key] ?? 0);
        }

        return [
            'datasets' => [[
                'label'           => 'CA (FCFA)',
                'data'            => $values,
                'borderColor'     => '#9C6B3F',   // cognac
                'backgroundColor' => 'rgba(156,107,63,0.15)',
                'fill'            => true,
                'tension'         => 0.3,
                'pointRadius'     => count($values) <= 31 ? 3 : 1,
            ]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => ['display' => false],
                'tooltip' => [
                    'callbacks' => [
                        // Formatage côté JS — on passe le suffixe en label.
                    ],
                ],
            ],
            'scales' => [
                'y' => [
                    'ticks' => [
                        'callback' => 'function(v){ return v.toLocaleString("fr-FR") + " F" }',
                    ],
                ],
            ],
        ];
    }

    /** Clés brutes de regroupement SQL pour l'alignement avec les labels. */
    private function getRawPeriodKeys(\Carbon\Carbon $from, \Carbon\Carbon $to, string $granularity): array
    {
        $keys = [];
        if ($granularity === 'day') {
            $period = \Carbon\CarbonPeriod::create($from->toDateString(), '1 day', $to->toDateString());
            foreach ($period as $d) {
                $keys[] = $d->toDateString();
            }
        } else {
            $cur = $from->copy()->startOfMonth();
            while ($cur->lte($to)) {
                $keys[] = $cur->format('Y-m');
                $cur->addMonth();
            }
        }
        return $keys;
    }
}
