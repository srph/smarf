<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HeroesController extends Controller
{
    public function store(Category $category) {
        $category->heroes()->attach(
            $request->get('hero_id')
            ['order' => $request->get('order')]
        );

        return $category;
    }

    public function update(Category $category) {
        $category->heroes()->updateExistingPivot(
            $request->get('hero_id'),
            ['order' => $request->get('order')]
        )

        return $category;
    }

    public function destroy(Category $category) {
        return $category->heroes()->detach(
            request()->get('hero_id');
        );
    }
}
