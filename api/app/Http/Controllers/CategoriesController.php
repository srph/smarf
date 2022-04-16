<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CategoriesController extends Controller
{
    public function store() {
        $inputs = request()->only([
            'board_id',
            'name',
            'x_position',
            'y_position',
            'width',
            'height',
        ])

        return Category::create($inputs)
    }

    public function update() {
        $inputs = request()->only([
            'board_id',
            'name',
            'x_position',
            'y_position',
            'width',
            'height',
        ])

        return $category->update($inputs);
    }

    public function destroy() {
        // @TODO: Truncate (?)
        return $category->delete();
    }
}
