<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

use App\Models\Board;
use App\Models\Category;
use App\Models\Hero;
use App\Models\User;

class BoardsIndexTest extends TestCase
{
    // Tests run against the local MySQL database, so roll back instead of refreshing it.
    use DatabaseTransactions;

    public function test_lists_boards_with_category_and_hero_counts()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*'], 'api');

        $board = Board::factory()->create(['user_id' => $user->id]);
        $empty = Board::factory()->create(['user_id' => $user->id]);

        // Hero rows are inserted by migrations, so use three of those.
        $heroes = Hero::take(3)->get();
        $carries = Category::factory()->create(['board_id' => $board->id]);
        $supports = Category::factory()->create(['board_id' => $board->id]);
        Category::factory()->create(['board_id' => $board->id]);

        $this->attach($carries, $heroes[0], 1);
        $this->attach($carries, $heroes[1], 2);
        $this->attach($supports, $heroes[2], 1);

        $response = $this->getJson('/api/boards')->assertOk();

        $boards = collect($response->json('boards'))->keyBy('id');
        $this->assertSame(3, $boards[$board->id]['categories_count']);
        $this->assertSame(3, $boards[$board->id]['heroes_count']);
        $this->assertSame(0, $boards[$empty->id]['categories_count']);
        $this->assertSame(0, $boards[$empty->id]['heroes_count']);
    }

    private function attach(Category $category, Hero $hero, int $order)
    {
        $category->heroes()->attach($hero->id, ['id' => Str::orderedUuid(), 'order' => $order]);
    }
}
