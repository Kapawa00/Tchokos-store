<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/**
 * Génère automatiquement un slug unique à la création, à partir du champ
 * `name`, si aucun slug n'a été fourni explicitement.
 */
trait HasUniqueSlug
{
    public static function bootHasUniqueSlug(): void
    {
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = $model->generateUniqueSlug();
            }
        });
    }

    protected function generateUniqueSlug(): string
    {
        $base = Str::slug($this->name);
        $slug = $base;
        $suffix = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
