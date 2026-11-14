<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
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
                ->withCount([
                    'categories',
                    // Each category_hero row is one hero placed in one of the board's categories.
                    'categories as heroes_count' => fn ($query) => $query->join('category_hero', 'category_hero.category_id', '=', 'categories.id')
                ])
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

            // One insert per category, since a start like Default places every hero. Not attach(): it keys rows by
            // hero id, and a category may hold the same hero twice.
            DB::table('category_hero')->insert(
                collect($input['heroes'] ?? [])->map(fn ($hero) => [
                    // @TODO: App\Traits\Uuid handle this for most tasks.
                    // Refactor so we're not manually doing this in the controller.
                    'id' => Str::orderedUuid()->toString(),
                    'category_id' => $category->id,
                    'hero_id' => $hero['id'],
                    'order' => $hero['order']
                ])->all()
            );
        });

        return response()->json([
            // The same shape as show(), so the UI can open the board without fetching it. fresh() also reads back
            // is_favorite and favorited_at, which create() leaves out.
            'board' => $board->fresh(['categories', 'categories.heroes'])
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
        $isFavorite = $request->boolean('is_favorite');

        $board->update([
            'is_favorite' => $isFavorite,
            'favorited_at' => $isFavorite ? now() : null
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
