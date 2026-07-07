<?php

namespace App\Observers;

use App\Models\Category;
use App\Services\FrontendRevalidator;

class CategoryObserver
{
    public function __construct(private readonly FrontendRevalidator $revalidator)
    {
    }

    public function saved(Category $category): void
    {
        $this->revalidator->revalidate(['categories']);
    }

    public function deleted(Category $category): void
    {
        $this->revalidator->revalidate(['categories']);
    }
}
