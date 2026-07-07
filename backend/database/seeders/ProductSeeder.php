<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /** Pointures adultes courantes. */
    private const ADULT_SIZES = ['38', '39', '40', '41', '42', '43', '44'];

    /** Pointures enfants courantes. */
    private const CHILD_SIZES = ['28', '29', '30', '31', '32', '33', '34'];

    public function run(): void
    {
        $categories = $this->resolveCategories();

        foreach ($this->productDefinitions() as $definition) {
            $category = $categories[$definition['category']];

            $product = Product::create([
                'name' => $definition['name'],
                'description' => $definition['description'],
                'category_id' => $category->id,
                'base_price' => $definition['base_price'],
                'wholesale_price' => $definition['wholesale_price'],
                'status' => 'active',
                'is_new' => $definition['is_new'],
            ]);

            $this->createVariants($product, $definition);
            $this->createMedia($product, $definition['is_new']);
        }
    }

    /**
     * @return array<string, Category>
     */
    private function resolveCategories(): array
    {
        $chaussures = Category::where('type', CategoryType::Family)->where('name', 'Chaussures')->firstOrFail();

        return [
            'hommes' => Category::where('type', CategoryType::Section)->where('parent_id', $chaussures->id)->where('name', 'Hommes')->firstOrFail(),
            'femmes' => Category::where('type', CategoryType::Section)->where('parent_id', $chaussures->id)->where('name', 'Femmes')->firstOrFail(),
            'enfants' => Category::where('type', CategoryType::Section)->where('parent_id', $chaussures->id)->where('name', 'Enfants')->firstOrFail(),
            'sacs' => Category::where('type', CategoryType::Family)->where('name', 'Sacs')->firstOrFail(),
            'ceintures' => Category::where('type', CategoryType::Family)->where('name', 'Ceintures')->firstOrFail(),
            'montres' => Category::where('type', CategoryType::Family)->where('name', 'Montres')->firstOrFail(),
        ];
    }

    private function createVariants(Product $product, array $definition): void
    {
        $colors = $definition['colors'];

        if ($definition['variant_kind'] === 'shoe') {
            $sizes = $definition['sizes'];
            $color = $colors[array_rand($colors)];

            foreach ($sizes as $size) {
                Variant::create([
                    'product_id' => $product->id,
                    'size' => $size,
                    'color' => $color,
                    'sku' => Str::upper(Str::slug($product->slug)).'-'.$size,
                    'stock' => fake()->numberBetween(0, 20),
                ]);
            }

            return;
        }

        // Accessoires (sacs, ceintures, montres) : variantes par couleur, sans pointure.
        foreach ($colors as $color) {
            Variant::create([
                'product_id' => $product->id,
                'size' => null,
                'color' => $color,
                'sku' => Str::upper(Str::slug($product->slug)).'-'.Str::upper(Str::slug($color)),
                'stock' => fake()->numberBetween(0, 20),
            ]);
        }
    }

    private function createMedia(Product $product, bool $isNew): void
    {
        Media::factory()->create([
            'product_id' => $product->id,
            'position' => 0,
        ]);

        Media::factory()->create([
            'product_id' => $product->id,
            'position' => 1,
        ]);

        // Les reels vidéo sont la particularité de ce client : on en donne un
        // à environ un produit sur trois, et systématiquement aux nouveautés.
        if ($isNew || fake()->boolean(30)) {
            Media::factory()->video()->create([
                'product_id' => $product->id,
                'position' => 2,
            ]);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function productDefinitions(): array
    {
        $hommeColors = ['Noir', 'Marron', 'Camel'];
        $femmeColors = ['Bordeaux', 'Beige', 'Noir', 'Camel'];
        $enfantColors = ['Bleu', 'Rose', 'Noir'];

        return [
            // Chaussures Hommes
            ['category' => 'hommes', 'name' => 'Sneakers Homme Cuir Camel', 'description' => 'Sneakers en cuir véritable, doublure respirante.', 'base_price' => 25000, 'wholesale_price' => 20000, 'is_new' => true, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Camel']],
            ['category' => 'hommes', 'name' => 'Derby Homme Noir Classique', 'description' => 'Derby habillé en cuir lisse, semelle gomme.', 'base_price' => 30000, 'wholesale_price' => 24000, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Noir']],
            ['category' => 'hommes', 'name' => 'Mocassins Homme Marron', 'description' => 'Mocassins souples, idéal usage quotidien.', 'base_price' => 22000, 'wholesale_price' => 17500, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Marron']],
            ['category' => 'hommes', 'name' => 'Bottines Homme Cuir Marron', 'description' => 'Bottines cuir robustes, parfaites pour la saison des pluies.', 'base_price' => 35000, 'wholesale_price' => 28000, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Marron']],
            ['category' => 'hommes', 'name' => 'Sandales Homme Cuir Tressé', 'description' => 'Sandales tressées à la main, confort toute la journée.', 'base_price' => 15000, 'wholesale_price' => 12000, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => $hommeColors],
            ['category' => 'hommes', 'name' => 'Baskets Homme Running Blanc', 'description' => 'Baskets légères, semelle amortissante.', 'base_price' => 28000, 'wholesale_price' => 22000, 'is_new' => true, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Blanc']],

            // Chaussures Femmes
            ['category' => 'femmes', 'name' => 'Escarpins Femme Bordeaux', 'description' => 'Escarpins élégants, talon 7cm.', 'base_price' => 27000, 'wholesale_price' => 21000, 'is_new' => true, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Bordeaux']],
            ['category' => 'femmes', 'name' => 'Sandales Femme Talon Doré', 'description' => 'Sandales habillées, brides ajustables.', 'base_price' => 18000, 'wholesale_price' => 14000, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Doré', 'Camel']],
            ['category' => 'femmes', 'name' => 'Ballerines Femme Beige', 'description' => 'Ballerines confortables, cuir souple.', 'base_price' => 16000, 'wholesale_price' => 12500, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Beige']],
            ['category' => 'femmes', 'name' => 'Bottes Femme Cuir Noir', 'description' => 'Bottes hautes, fermeture éclair latérale.', 'base_price' => 38000, 'wholesale_price' => 30000, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Noir']],
            ['category' => 'femmes', 'name' => 'Sneakers Femme Blanc Rose', 'description' => 'Sneakers tendance, semelle épaisse.', 'base_price' => 24000, 'wholesale_price' => 19000, 'is_new' => true, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => ['Blanc']],
            ['category' => 'femmes', 'name' => 'Mules Femme Camel', 'description' => 'Mules à enfiler, talon carré confortable.', 'base_price' => 19000, 'wholesale_price' => 15000, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::ADULT_SIZES, 'colors' => $femmeColors],

            // Chaussures Enfants
            ['category' => 'enfants', 'name' => 'Sneakers Enfant Garçon Bleu', 'description' => 'Sneakers enfant résistantes, fermeture scratch.', 'base_price' => 12000, 'wholesale_price' => 9500, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::CHILD_SIZES, 'colors' => ['Bleu']],
            ['category' => 'enfants', 'name' => 'Sandales Enfant Fille Rose', 'description' => 'Sandales légères pour l\'été.', 'base_price' => 9000, 'wholesale_price' => 7000, 'is_new' => true, 'variant_kind' => 'shoe', 'sizes' => self::CHILD_SIZES, 'colors' => ['Rose']],
            ['category' => 'enfants', 'name' => 'Chaussures Enfant Scolaire Noir', 'description' => 'Chaussures scolaires robustes, semelle antidérapante.', 'base_price' => 14000, 'wholesale_price' => 11000, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::CHILD_SIZES, 'colors' => ['Noir']],
            ['category' => 'enfants', 'name' => 'Bottines Enfant Hiver Marron', 'description' => 'Bottines doublées, confort pour la saison fraîche.', 'base_price' => 16000, 'wholesale_price' => 12500, 'is_new' => false, 'variant_kind' => 'shoe', 'sizes' => self::CHILD_SIZES, 'colors' => $enfantColors],

            // Sacs
            ['category' => 'sacs', 'name' => 'Sac à Main Femme Bordeaux', 'description' => 'Sac à main cuir, compartiment intérieur zippé.', 'base_price' => 22000, 'wholesale_price' => 17000, 'is_new' => true, 'variant_kind' => 'accessory', 'colors' => ['Bordeaux', 'Noir']],
            ['category' => 'sacs', 'name' => 'Sac à Dos Cuir Homme Marron', 'description' => 'Sac à dos cuir, compartiment laptop.', 'base_price' => 26000, 'wholesale_price' => 20000, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Marron', 'Noir']],
            ['category' => 'sacs', 'name' => 'Sacoche Bandoulière Camel', 'description' => 'Sacoche compacte, bandoulière réglable.', 'base_price' => 18000, 'wholesale_price' => 14000, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Camel']],
            ['category' => 'sacs', 'name' => 'Sac Cabas Femme Beige', 'description' => 'Grand cabas, idéal courses et travail.', 'base_price' => 20000, 'wholesale_price' => 15500, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Beige', 'Camel']],
            ['category' => 'sacs', 'name' => 'Sac à Main Soirée Noir', 'description' => 'Pochette de soirée, fermoir doré.', 'base_price' => 24000, 'wholesale_price' => 19000, 'is_new' => true, 'variant_kind' => 'accessory', 'colors' => ['Noir']],

            // Ceintures
            ['category' => 'ceintures', 'name' => 'Ceinture Cuir Réversible Noir Marron', 'description' => 'Ceinture réversible deux couleurs, boucle amovible.', 'base_price' => 9500, 'wholesale_price' => 7500, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Noir / Marron']],
            ['category' => 'ceintures', 'name' => 'Ceinture Cuir Boucle Dorée', 'description' => 'Ceinture cuir véritable, boucle dorée.', 'base_price' => 8500, 'wholesale_price' => 6500, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Marron', 'Noir']],
            ['category' => 'ceintures', 'name' => 'Ceinture Tressée Camel', 'description' => 'Ceinture tressée, look décontracté.', 'base_price' => 7500, 'wholesale_price' => 6000, 'is_new' => true, 'variant_kind' => 'accessory', 'colors' => ['Camel']],
            ['category' => 'ceintures', 'name' => 'Ceinture Cuir Classique Noir', 'description' => 'Ceinture cuir classique, boucle argentée.', 'base_price' => 8000, 'wholesale_price' => 6200, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Noir']],

            // Montres
            ['category' => 'montres', 'name' => 'Montre Homme Cuir Marron Classique', 'description' => 'Montre quartz, bracelet cuir véritable.', 'base_price' => 35000, 'wholesale_price' => 28000, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Marron']],
            ['category' => 'montres', 'name' => 'Montre Femme Bracelet Doré', 'description' => 'Montre élégante, bracelet métal doré.', 'base_price' => 32000, 'wholesale_price' => 25000, 'is_new' => true, 'variant_kind' => 'accessory', 'colors' => ['Doré']],
            ['category' => 'montres', 'name' => 'Montre Homme Acier Noir', 'description' => 'Montre robuste, boîtier acier inoxydable.', 'base_price' => 45000, 'wholesale_price' => 36000, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Noir']],
            ['category' => 'montres', 'name' => 'Montre Femme Cuir Beige', 'description' => 'Montre fine, bracelet cuir beige.', 'base_price' => 28000, 'wholesale_price' => 22000, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Beige']],
            ['category' => 'montres', 'name' => 'Montre Enfant Sport Bleu', 'description' => 'Montre enfant résistante à l\'eau, bracelet silicone.', 'base_price' => 15000, 'wholesale_price' => 12000, 'is_new' => false, 'variant_kind' => 'accessory', 'colors' => ['Bleu', 'Rose']],
        ];
    }
}
