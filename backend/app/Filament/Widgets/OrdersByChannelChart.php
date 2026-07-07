<?php

namespace App\Filament\Widgets;

use App\Enums\OrderChannel;
use App\Filament\Concerns\HasDateRangeFilter;
use App\Models\Order;
use Filament\Widgets\ChartWidget;

class OrdersByChannelChart extends ChartWidget
{
    use HasDateRangeFilter;

    protected static ?string $heading = 'Commandes par canal';
    protected static ?int    $sort    = 5;

    protected int|string|array $columnSpan = 1;

    /** @var array<string, mixed>|null */
    public ?array $filters = null;

    protected function getData(): array
    {
        [$from, $to] = $this->getDateRange();

        $counts = Order::whereBetween('created_at', [$from, $to])
            ->selectRaw('channel, COUNT(*) as total')
            ->groupBy('channel')
            ->pluck('total', 'channel');

        $labels = [];
        $values = [];
        foreach (OrderChannel::cases() as $channel) {
            $labels[] = match ($channel) {
                OrderChannel::Whatsapp => 'WhatsApp',
                OrderChannel::Email    => 'E-mail',
                OrderChannel::Site     => 'Site',
            };
            $values[] = (int) ($counts[$channel->value] ?? 0);
        }

        return [
            'datasets' => [[
                'label'           => 'Commandes',
                'data'            => $values,
                'backgroundColor' => ['#5B6B57', '#9C6B3F', '#C89B6A'],
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
            'plugins' => ['legend' => ['position' => 'bottom']],
        ];
    }
}
