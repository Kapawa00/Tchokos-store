<?php

namespace App\Filament\Widgets;

use App\Enums\PaymentMethod;
use App\Filament\Concerns\HasDateRangeFilter;
use App\Models\Transaction;
use Filament\Widgets\ChartWidget;

class PaymentMethodChart extends ChartWidget
{
    use HasDateRangeFilter;

    protected static ?string $heading = 'Répartition des paiements';
    protected static ?int    $sort    = 8;

    protected int|string|array $columnSpan = 1;

    /** @var array<string, mixed>|null */
    public ?array $filters = null;

    protected function getData(): array
    {
        [$from, $to] = $this->getDateRange();

        $counts = Transaction::whereBetween('created_at', [$from, $to])
            ->where('status', 'completed')
            ->selectRaw('method, COUNT(*) as total')
            ->groupBy('method')
            ->pluck('total', 'method');

        $colorMap = [
            PaymentMethod::OrangeMoney->value => '#F97316', // orange vif
            PaymentMethod::Momo->value        => '#EAB308', // jaune MTN
            PaymentMethod::Whatsapp->value    => '#5B6B57', // sage
        ];

        $labels = [];
        $values = [];
        $colors = [];

        foreach (PaymentMethod::cases() as $method) {
            $labels[] = $method->label();
            $values[] = (int) ($counts[$method->value] ?? 0);
            $colors[] = $colorMap[$method->value];
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
        return 'pie';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => ['legend' => ['position' => 'bottom']],
        ];
    }
}
