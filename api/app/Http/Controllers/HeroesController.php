<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;

use App\Models\Hero;
use App\Models\Category;
use App\Http\Requests\InsertHeroRequest;
use App\Http\Requests\RemoveHeroRequest;
use App\Http\Requests\ReorderHeroRequest;

class HeroesController extends Controller
{
    public function index()
    {
        return response()->json([
            'heroes' => Hero::orderBy('name')->get()
        ]);
    }

    /**
     * Insert hero to a category
     */
    public function insert(InsertHeroRequest $request, Category $category)
    {
        $category->height = $request->get('category_height');

        $category->save();

        $uuid = Str::uuid()->toString();

        $category->heroes()->attach(
            $request->get('hero_id'),
            // WARNING: We should probably make a trait for this haha
            ['id' => $uuid, 'order' => $request->get('hero_order')]
        );

        // @TODO: Make this reusable
        $hero = $category->heroes()->wherePivot('id', $uuid)->first();

        return response()->json([
            'hero' => $hero
        ]);
    }

    /**
     * Reorder a hero inside a category
     */
    public function reorder(ReorderHeroRequest $request, Category $category, Hero $hero)
    {
        if ($category->id === $request->get('to_category_id')) {
            $hero->pivot->order = $request->get('hero_order');

            $hero->push();
        } else {
            $category->heroes()->wherePivot('id', $hero->pivot->id)->detach();

            $category->update(['height' => $request->get('from_category_height')]);

            $to = Category::where('id', $request->get('to_category_id'))->first();

            $to->update(['height' => $request->get('to_category_height')]);

            $to->heroes()->attach(
                $hero->id,
                ['id' => $hero->pivot->id, 'order' => $request->get('hero_order')]
            );
        }

        // @TODO: Return both from/to categories
        return response()->json([
            'hero' => $hero
        ]);
    }

    /**
     * Remove a hero from a category
     */
    /**
     * Remove one hero from a category. `$hero` is bound by its pivot id, so only that entry goes,
     * even when the same hero is in the category twice.
     */
    public function remove(RemoveHeroRequest $request, Category $category, Hero $hero)
    {
        $category->heroes()->wherePivot('id', $hero->pivot->id)->detach();

        $category->update(['height' => $request->get('category_height')]);

        return response()->json([
            'category' => $category
        ]);
    }
}
