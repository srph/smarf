<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Http\Requests\MoveCategoryRequest;

class CategoriesController extends Controller
{
    public function store()
    {
        $inputs = request()->only([
            'board_id',
            'name',
            'x_position',
            'y_position',
            'width',
            'height',
        ]);

        return response()->json([
            'categories' => Category::create($inputs)
        ]);
    }

    public function move(MoveCategoryRequest $request, Category $category)
    {
        $category->y_position = $request->get('y_position');

        $category->x_position = $request->get('x_position');

        $category->save();

        return response()->json([
            'category' => $category
        ]);
    }

    public function update(Category $category)
    {
        $inputs = request()->only([
            'board_id',
            'name',
            'x_position',
            'y_position',
            'width',
            'height',
        ]);

        return response()->json([
            'categories' => $category->update($inputs)
        ]);
    }

    public function destroy(Category $category)
    {
        // @TODO: Truncate (?)
        return response()->json([
            'categories' => $category->delete()
        ]);
    }
}
