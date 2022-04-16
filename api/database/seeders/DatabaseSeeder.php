<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\User;
use App\Models\Board;
use App\Models\Category;
use App\Models\Hero;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();

        $heroes = Hero::factory()->count(100)->create();

        $users = Hero::factory()->count(10)
            ->has(Board::factory()->count(10)->has(Category::factory()->count(2)));

        Board::all()->each(function(Board $board) {
            $board->categories->each(function(Category $category) {
                $category->attach($heroes->random(3)->pluck('id')->toArray());
            });
        });
    }
}
