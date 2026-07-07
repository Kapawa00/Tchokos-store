<?php

namespace App\Filament\Widgets;

use App\Filament\Concerns\HasDateRangeFilter;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SalesByFamilyChart extends ChartWidget
{
    use HasDateRangeFilter;

    protected static ?string $heading = 'Ventes par famille de produits';
    protected static ?int    $sort    = 6;

    protected int|string|array $columnSpan = 2;

    /** @var array<string, mixed>|null */
    public ?array $filters = null;

    /**
     * Familles reconnues par correspondance LIKE sur `product_name`.
     * `order_items` snapshote le nom du produit au moment de l'achat (pas de FK).
     * Les patterns couvrent singulier/pluriel et variantes d'accentuation.
     *
     * @var array<string, string[]>
     */
    private const FAMILIES = [
        'Chaussures' => ['%chaussure%', '%basket%', '%sandale%', '%escarpin%', '%mocassin%', '%botte%', '%sneaker%'],
        'Sacs'       => ['%sac%', '%pochette%', '%cabas%', '%cartable%'],
        'Ceintures'  => ['%ceinture%', '%belt%'],
        'Montres'    => ['%montre%', '%watch%'],
    ];

    protected function getData(): array
    {
        [$from, $to] = $this->getDateRange();

        $cacheKey = 'dashboard.sales_family.' . md5(serialize($this->filters));

        $data = Cache::remember($cacheKey, 120, function () use ($from, $to) {
            // order_items ne contient pas product_id (snapshot du nom au moment
            // de l'achat) → on regroupe par LIKE sur product_name.
            $rows = DB::table('order_items as oi')
                ->join('orders as o', 'o.id', '=', 'oi.order_id')
                ->whereBetween('o.created_at', [$from, $to])
                ->whereNotIn('o.status', ['pending_payment', 'cancelled'])
                ->selectRaw('LOWER(oi.product_name) as name_lc, SUM(oi.quantity * oi.unit_price) as revenue')
                ->groupBy('name_lc')
                ->get();

            $totals = array_fill_keys(array_keys(self::FAMILIES), 0.0);
            $totals['Autres'] = 0.0;

            foreach ($rows as $row) {
                $matched = false;
                foreach (self::FAMILIES as $family => $patterns) {
                    foreach ($patterns as $pattern) {
                        // Vérification côté PHP (pattern déjà récupéré en LOWER).
                        if (str_contains($row->name_lc, trim($pattern, '%'))) {
                            $totals[$family] += (float) $row->revenue;
                            $matched = true;
                            break 2;
                        }
                    }
                }
                if (!$matched) {
                    $totals['Autres'] += (float) $row->revenue;
                }
            }

            // Exclure les familles à zéro pour un graphe lisible.
            return array_filter($totals, fn ($v) => $v > 0);
        });

        if (empty($data)) {
            return ['datasets' => [['label' => 'CA (FCFA)', 'data' => [], 'backgroundColor' => []]], 'labels' => []];
        }

        // Couleurs charte : ordre fixe pour que Chaussures soit toujours cognac, etc.
        $paletteMap = [
            'Chaussures' => '#9C6B3F', // cognac
            'Sacs'       => '#5B6B57', // sage
            'Ceintures'  => '#B89A5E', // brass
            'Montres'    => '#7A3B3B', // bordeaux
            'Autres'     => '#6E6258', // taupe
        ];

        $labels = array_keys($data);
        $values = array_values($data);
        $colors = array_map(fn ($l) => $paletteMap[$l] ?? '#E5DCCD', $labels);

        return [
            'datasets' => [[
                'label'           => 'CA (FCFA)',
                'data'            => $values,
                'backgroundColor' => $colors,
                'borderRadius'    => 4,
            ]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => ['display' => false],
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
}
