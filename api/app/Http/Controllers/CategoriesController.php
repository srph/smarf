<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use App\Models\Category;
use App\Models\Board;
use App\Http\Requests\MoveCategoryRequest;
use App\Http\Requests\ResizeCategoryRequest;
use App\Http\Requests\CreateCategoryRequest;

class CategoriesController extends Controller
{
    public function store(CreateCategoryRequest $request, Board $board)
    {
        $inputs = $request->only([
            'name',
            'x_position',
            'y_position',
            'width',
            'height',
        ]);

        $category = new Category($inputs);

        $board->categories()->save($category);

        return response()->json([
            'category' => $category->load('heroes')
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

    public function resize(ResizeCategoryRequest $request, Category $category)
    {
        $category->width = $request->get('width');

        $category->height = $request->get('height');

        $category->save();

        return response()->json([
            'category' => $category
        ]);
    }

    public function update(Request $request, Category $category)
    {
        // `sometimes`: a rename doesn't send a color.
        $request->validate([
            'color' => ['sometimes', 'nullable', Rule::in(Category::COLORS)],
        ]);

        // only() keeps a color sent as null, which clears it.
        $inputs = $request->only([
            'board_id',
            'name',
            'x_position',
            'y_position',
            'width',
            'height',
            'color',
        ]);

        return response()->json([
            'categories' => $category->update($inputs)
        ]);
    }

    public function destroy(Category $category)
    {
        // @TODO: Truncate (?)
        $category->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
