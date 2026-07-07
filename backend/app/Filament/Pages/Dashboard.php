<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\LowStockWidget;
use App\Filament\Widgets\NewCustomersChart;
use App\Filament\Widgets\OrdersByChannelChart;
use App\Filament\Widgets\OrdersByStatusChart;
use App\Filament\Widgets\PaymentMethodChart;
use App\Filament\Widgets\PendingWholesaleWidget;
use App\Filament\Widgets\RecentCustomersWidget;
use App\Filament\Widgets\Top10ProductsChart;
use App\Filament\Widgets\RecentOrdersWidget;
use App\Filament\Widgets\RevenueChartWidget;
use App\Filament\Widgets\SalesByFamilyChart;
use App\Filament\Widgets\StatsOverviewWidget;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Pages\Dashboard as BaseDashboard;
use Filament\Pages\Dashboard\Concerns\HasFiltersForm;

class Dashboard extends BaseDashboard
{
    use HasFiltersForm;

    protected static ?string $navigationIcon  = 'heroicon-o-home';
    protected static ?string $navigationLabel = 'Tableau de bord';
    protected static ?string $title           = 'Tableau de bord';
    protected static ?int    $navigationSort  = -1;

    // Grille 3 colonnes sur grand écran pour les widgets.
    public function getColumns(): int|string|array
    {
        return [
            'md' => 2,
            'xl' => 3,
        ];
    }

    /**
     * Formulaire de filtre global affiché en haut du tableau de bord.
     * Filament injecte `$this->filters` dans chaque widget automatiquement.
     */
    public function filtersForm(Form $form): Form
    {
        return $form->schema([
            Select::make('period')
                ->label('Période')
                ->options([
                    'today'  => "Aujourd'hui",
                    '7d'     => '7 derniers jours',
                    '30d'    => '30 derniers jours',
                    'month'  => 'Ce mois',
                    'year'   => 'Cette année',
                    'custom' => 'Période personnalisée',
                ])
                ->default('30d')
                ->live(),

            DatePicker::make('date_from')
                ->label('Du')
                ->displayFormat('d/m/Y')
                ->default(now()->subMonth())
                ->visible(fn ($get) => $get('period') === 'custom')
                ->live(),

            DatePicker::make('date_to')
                ->label('Au')
                ->displayFormat('d/m/Y')
                ->default(now())
                ->visible(fn ($get) => $get('period') === 'custom')
                ->live(),
        ])->columns(3);
    }

    /**
     * Ordre et organisation des widgets.
     */
    public function getWidgets(): array
    {
        return [
            // 1. Cartes d'indicateurs (pleine largeur)
            StatsOverviewWidget::class,

            // 2. Graphiques principaux
            RevenueChartWidget::class,
            OrdersByStatusChart::class,
            OrdersByChannelChart::class,
            SalesByFamilyChart::class,
            Top10ProductsChart::class,
            PaymentMethodChart::class,
            NewCustomersChart::class,

            // 3. Tableaux
            RecentOrdersWidget::class,
            LowStockWidget::class,
            PendingWholesaleWidget::class,
            RecentCustomersWidget::class,
        ];
    }
}
