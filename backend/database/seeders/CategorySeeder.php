<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $families = ['Chaussures', 'Sacs', 'Ceintures', 'Montres'];

        foreach ($families as $position => $name) {
            Category::create([
                'name' => $name,
                'type' => CategoryType::Family,
                'position' => $position,
            ]);
        }

        $chaussures = Category::where('type', CategoryType::Family)
            ->where('name', 'Chaussures')
            ->first();

        $sections = ['Hommes', 'Femmes', 'Enfants'];

        foreach ($sections as $position => $name) {
            Category::create([
                'name' => $name,
                'type' => CategoryType::Section,
                'parent_id' => $chaussures->id,
                'position' => $position,
            ]);
        }
    }
}
