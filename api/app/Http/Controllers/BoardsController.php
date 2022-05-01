<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\Category;
use App\Http\Requests\CreateBoardRequest;
use App\Http\Requests\UpdateBoardRequest;

class BoardsController extends Controller
{
    public function index()
    {
        return response()->json([
            'boards' => request()->user()->boards
        ]);
    }

    public function store(CreateBoardRequest $request)
    {
        $board = Board::create([
            'name' => $request->input('name')
        ]);

        $categories = collect($request->input('categories'))->map(function ($input) {
            $category = Category::create([
                'name' => $input['name'],
                'x_position' => $input['x_position'],
                'y_position' => $input['y_position'],
                'width' => $input['width'],
                'height' => $input['width'],
            ]);

            $category->attach($input['heroes']);

            return response()->json([
                'category' => $category
            ]);
        });

        $board->attach($categories->pluck('id')->toArray());

        return response()->json([
            'board' => $board
        ]);
    }

    public function show(Board $board)
    {
        return response()->json([
            'board' => $board->load('categories', 'categories.heroes')
        ]);
    }

    public function update(UpdateBoardRequest $request, Board $board)
    {
        return response()->json([
            'board' => $board->update([
                'name' => $request->input('name')
            ])
        ]);
    }

    public function destroy(Board $board)
    {
        return response()->json([
            'board' => $board->delete()
        ]);
    }
}
