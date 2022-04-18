<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\User;
use App\Models\Board;
use App\Models\Category;
use App\Models\Hero;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Truncate all tables
     * 
     * @return void
     */
    protected function truncate()
    {
        User::truncate();
        Board::truncate();
        Category::truncate();
        Hero::truncate();
    }

    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->truncate();

        $heroes = Hero::factory()->count(100)->create();

        User::factory()->count(10)
            ->has(Board::factory()->count(10)->has(Category::factory()->count(2)))
            ->create();

        Board::all()->each(function (Board $board) use ($heroes) {
            $board->categories->each(function (Category $category) use ($heroes) {
                $heroes->random(3)->each(function ($hero, $index) use ($category) {
                    $category->heroes()->attach([$hero->id], [
                        'id' => Str::uuid(),
                        'order' => $index * 1024
                    ]);
                });
            });
        });
    }
}
