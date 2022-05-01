<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;

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
            'user_id' => $request->user()->id,
            'name' => $request->input('name')
        ]);

        collect($request->input('categories'))->each(function ($input) use ($board) {
            $category = Category::create([
                'board_id' => $board->id,
                'name' => $input['name'],
                'x_position' => $input['x_position'],
                'y_position' => $input['y_position'],
                'width' => $input['width'],
                'height' => $input['width'],
            ]);

            collect($input['heroes'])->each(function ($hero) use ($category) {
                $category->heroes()->attach($hero['id'], [
                    // @TODO: App\Traits\Uuid handle this for most tasks.
                    // Refactor so we're not manually doing this in the controller.
                    'id' => Str::orderedUuid(),
                    'order' => $hero['order']
                ]);
            });
        });

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
