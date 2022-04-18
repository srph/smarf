<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;

use App\Models\Hero;
use App\Models\Category;
use App\Http\Requests\InsertHeroRequest;
use App\Http\Requests\ReorderHeroRequest;

class HeroesController extends Controller
{
    public function index()
    {
        return response()->json([
            'heroes' => Hero::all()
        ]);
    }

    /**
     * Insert hero to a category
     */
    public function insert(InsertHeroRequest $request, Category $category)
    {
        $category->heroes()->attach(
            $request->get('hero_id'),
            // WARNING: We should probably make a trait for this haha
            ['id' => Str::uuid()->toString(), 'order' => $request->get('order')]
        );

        return response()->json([
            'category' => $category
        ]);
    }

    /**
     * Reorder a hero inside a category
     */
    public function reorder(ReorderHeroRequest $request, Hero $hero)
    {
        $hero->pivot->order = $request->input('order');
        $hero->pivot->save();

        return response()->json([
            'category' => $hero->category
        ]);
    }

    /**
     * Remove a hero from a category
     */
    public function remove(Category $category)
    {
        return response()->json([
            'category' => $category->heroes()->detach(
                request()->input('hero_id')
            )
        ]);
    }
}
