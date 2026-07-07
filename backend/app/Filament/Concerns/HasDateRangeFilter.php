<?php

namespace App\Filament\Concerns;

use Carbon\Carbon;
use Carbon\CarbonPeriod;

/**
 * Trait partagé par tous les widgets qui réagissent au filtre de période global.
 * Lit `$this->filters['period']`, 'date_from', 'date_to' (injectés par Filament).
 */
trait HasDateRangeFilter
{
    /**
     * Retourne [Carbon $from, Carbon $to] en fonction du filtre de période.
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    protected function getDateRange(): array
    {
        $period  = $this->filters['period']    ?? '30d';
        $rawFrom = $this->filters['date_from'] ?? null;
        $rawTo   = $this->filters['date_to']   ?? null;

        return match ($period) {
            'today'  => [today()->startOfDay(), today()->endOfDay()],
            '7d'     => [now()->subDays(7)->startOfDay(), now()->endOfDay()],
            'month'  => [now()->startOfMonth()->startOfDay(), now()->endOfDay()],
            'year'   => [now()->startOfYear()->startOfDay(), now()->endOfDay()],
            'custom' => [
                $rawFrom ? Carbon::parse($rawFrom)->startOfDay() : now()->subDays(30)->startOfDay(),
                $rawTo   ? Carbon::parse($rawTo)->endOfDay()     : now()->endOfDay(),
            ],
            default  => [now()->subDays(30)->startOfDay(), now()->endOfDay()], // 30d
        };
    }

    /**
     * Retourne [Carbon $from, Carbon $to] pour la période précédente (comparaison).
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    protected function getPreviousDateRange(): array
    {
        [$from, $to] = $this->getDateRange();
        $diff = $from->diffInSeconds($to);
        return [
            $from->copy()->subSeconds((int) $diff + 1),
            $from->copy()->subSecond(),
        ];
    }

    /**
     * Granularité de regroupement temporel selon la durée de la période.
     * Court (≤ 31 j) → par jour ; long (> 31 j) → par mois.
     */
    protected function getGranularity(): string
    {
        [$from, $to] = $this->getDateRange();
        return $from->diffInDays($to) <= 31 ? 'day' : 'month';
    }

    /**
     * Liste des labels (date) pour la période courante selon la granularité.
     * @return string[]
     */
    protected function getPeriodLabels(): array
    {
        [$from, $to] = $this->getDateRange();
        $granularity  = $this->getGranularity();
        $labels = [];

        if ($granularity === 'day') {
            $period = CarbonPeriod::create($from->toDateString(), '1 day', $to->toDateString());
            foreach ($period as $date) {
                $labels[] = $date->isoFormat('D MMM');
            }
        } else {
            $cur = $from->copy()->startOfMonth();
            while ($cur->lte($to)) {
                $labels[] = $cur->isoFormat('MMM YYYY');
                $cur->addMonth();
            }
        }

        return $labels;
    }

    /**
     * Formate un montant en FCFA.
     */
    protected function fcfa(float|int|string $amount): string
    {
        return number_format((float) $amount, 0, ',', ' ') . ' FCFA';
    }

    /**
     * Variation en % vs période précédente (+5 % / −12 %).
     */
    protected function variation(float $current, float $previous): string
    {
        if ($previous == 0) {
            return $current > 0 ? '+∞ %' : '—';
        }
        $pct = (($current - $previous) / $previous) * 100;
        return ($pct >= 0 ? '+' : '') . number_format($pct, 1) . ' %';
    }

    /**
     * Couleur Filament selon la variation (hausse = success, baisse = danger).
     */
    protected function variationColor(float $current, float $previous, bool $inverse = false): string
    {
        if ($previous == 0) return 'gray';
        $up = $current >= $previous;
        if ($inverse) $up = !$up; // ex. commandes en attente : moins c'est mieux
        return $up ? 'success' : 'danger';
    }
}
