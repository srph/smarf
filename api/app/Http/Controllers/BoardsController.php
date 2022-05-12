<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;

use App\Models\Board;
use App\Models\Category;
use App\Http\Requests\CreateBoardRequest;
use App\Http\Requests\FavoriteBoardRequest;
use App\Http\Requests\UpdateBoardRequest;

class BoardsController extends Controller
{
    public function index()
    {
        return response()->json([
            'boards' => request()->user()
                ->boards()
                ->orderBy('created_at', 'desc')
                ->get()
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
                'height' => $input['height'],
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

    public function duplicate(Board $original)
    {
        $board = $original->replicate();

        $board->name = "Copy of {$original->name}";

        $board->push();

        $original->categories->each(function ($original) use ($board) {
            $category = $original->replicate();

            $category->board_id = $board->id;

            $category->push();

            $heroes = $original->heroes->flatMap(function ($hero) {
                $uuid = Str::uuid()->toString();

                return [
                    // WARNING: We should probably make a trait for this haha
                    $hero->id => ['id' => $uuid, 'order' => $hero->pivot->order]
                ];
            });

            $category->heroes()->attach($heroes);
        });

        return response()->json([
            'board' => $board
        ]);
    }

    public function favorite(FavoriteBoardRequest $request, Board $board)
    {
        $board->update([
            'is_favorite' => $request->get('is_favorite')
        ]);

        return response()->json([
            'board' => $board
        ]);
    }

    public function update(UpdateBoardRequest $request, Board $board)
    {
        $board->update([
            'name' => $request->input('name')
        ]);

        return response()->json([
            'board' => $board
        ]);
    }

    public function destroy(Board $board)
    {
        // @TODO: Truncate (?)
        $board->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
