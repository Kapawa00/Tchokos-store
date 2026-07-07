<?php

namespace App\Filament\Resources\ReelResource\Pages;

use App\Filament\Resources\ReelResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListReels extends ListRecords
{
    protected static string $resource = ReelResource::class;

    protected static ?string $title = 'Mur de reels — ordre d\'affichage';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('Ajouter un reel'),
        ];
    }
}
