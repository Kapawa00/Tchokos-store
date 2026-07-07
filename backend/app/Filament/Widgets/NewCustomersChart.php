<?php

namespace App\Filament\Widgets;

use App\Enums\UserRole;
use App\Filament\Concerns\HasDateRangeFilter;
use App\Models\User;
use Carbon\CarbonPeriod;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;

class NewCustomersChart extends ChartWidget
{
    use HasDateRangeFilter;

    protected static ?string $heading = 'Nouveaux clients dans le temps';
    protected static ?int    $sort    = 9;

    protected int|string|array $columnSpan = 2;

    /** @var array<string, mixed>|null */
    public ?array $filters = null;

    protected function getData(): array
    {
        [$from, $to] = $this->getDateRange();
        $granularity = $this->getGranularity();
        $labels      = $this->getPeriodLabels();

        $cacheKey = 'dashboard.new_customers.' . md5(serialize($this->filters));

        $raw = Cache::remember($cacheKey, 120, function () use ($from, $to, $granularity) {
            if ($granularity === 'day') {
                $format = 'DATE(created_at)';
            } else {
                $format = "DATE_FORMAT(created_at, '%Y-%m')";
            }

            return User::where('role', UserRole::Customer)
                ->whereBetween('created_at', [$from, $to])
                ->selectRaw("{$format} as period, COUNT(*) as total")
                ->groupBy('period')
                ->orderBy('period')
                ->pluck('total', 'period')
                ->toArray();
        });

        // Aligner sur les labels
        $values = [];
        foreach ($this->getRawPeriodKeys($from, $to, $granularity) as $key) {
            $values[] = (int) ($raw[$key] ?? 0);
        }

        return [
            'datasets' => [[
                'label'           => 'Nouveaux clients',
                'data'            => $values,
                'borderColor'     => '#5B6B57',          // sage
                'backgroundColor' => 'rgba(91,107,87,0.12)',
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
            'plugins' => ['legend' => ['display' => false]],
            'scales'  => ['y' => ['ticks' => ['stepSize' => 1]]],
        ];
    }

    private function getRawPeriodKeys(\Carbon\Carbon $from, \Carbon\Carbon $to, string $granularity): array
    {
        $keys = [];
        if ($granularity === 'day') {
            $period = CarbonPeriod::create($from->toDateString(), '1 day', $to->toDateString());
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
