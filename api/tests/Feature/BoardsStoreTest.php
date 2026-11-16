<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

use App\Models\Hero;
use App\Models\User;

class BoardsStoreTest extends TestCase
{
    // Tests run against the local MySQL database, so roll back instead of refreshing it.
    use DatabaseTransactions;

    public function test_returns_the_board_with_its_categories_and_heroes_in_order()
    {
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        // Hero rows are inserted by migrations, so use two of those.
        [$a, $b] = Hero::orderBy('name')->take(2)->get();

        $board = $this->postJson('/api/boards', [
            'name' => 'Untitled',
            'categories' => [
                $this->category('S Tier', [[$b, 1024], [$a, 2048]]),
                $this->category('F Tier', [])
            ]
        ])->assertOk()->json('board');

        // The shape GET /boards/{board} returns, which the UI caches as is
        $this->assertSame('Untitled', $board['name']);
        $this->assertArrayHasKey('is_favorite', $board);
        $this->assertNull($board['favorited_at']);
        // Categories come back in no set order (the UI places them by position), so look them up by name.
        $categories = collect($board['categories'])->keyBy('name');
        $this->assertEqualsCanonicalizing(['S Tier', 'F Tier'], $categories->keys()->all());
        $this->assertSame([$b->id, $a->id], array_column($categories['S Tier']['heroes'], 'id'));
        $this->assertEquals(2048, $categories['S Tier']['heroes'][1]['pivot']['order']);
        $this->assertSame([], $categories['F Tier']['heroes']);

        $this->assertEquals($board, $this->getJson("/api/boards/{$board['slug']}")->json('board'));
    }

    public function test_a_category_can_start_with_the_same_hero_twice()
    {
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');
        $hero = Hero::first();

        $board = $this->postJson('/api/boards', [
            'name' => 'Untitled',
            'categories' => [$this->category('Twice', [[$hero, 1], [$hero, 2]])]
        ])->assertOk()->json('board');

        $this->assertCount(2, $board['categories'][0]['heroes']);
    }

    public function test_rejects_an_unknown_hero()
    {
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        $this->postJson('/api/boards', [
            'name' => 'Untitled',
            'categories' => [[
                'name' => 'S Tier', 'x_position' => 0, 'y_position' => 0, 'width' => 536, 'height' => 97,
                'heroes' => [['id' => (string) Str::uuid(), 'order' => 1]]
            ]]
        ])->assertUnprocessable();
    }

    public function test_a_category_can_start_with_a_color()
    {
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        $board = $this->postJson('/api/boards', [
            'name' => 'Untitled',
            'categories' => [
                ['color' => 'red'] + $this->category('S Tier', []),
                $this->category('F Tier', [])
            ]
        ])->assertOk()->json('board');

        $categories = collect($board['categories'])->keyBy('name');
        $this->assertSame('red', $categories['S Tier']['color']);
        $this->assertNull($categories['F Tier']['color']);
    }

    public function test_rejects_an_unknown_color()
    {
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        $this->postJson('/api/boards', [
            'name' => 'Untitled',
            'categories' => [['color' => 'beige'] + $this->category('S Tier', [])]
        ])->assertUnprocessable();
    }

    public function test_requires_sign_in()
    {
        $this->postJson('/api/boards', ['name' => 'Untitled', 'categories' => []])->assertUnauthorized();
    }

    /** A category as the UI sends it; $heroes is [[Hero, order], ...]. */
    protected function category(string $name, array $heroes): array
    {
        return [
            'name' => $name,
            'x_position' => 0,
            'y_position' => 0,
            'width' => 536,
            'height' => 97,
            'heroes' => array_map(fn ($entry) => ['id' => $entry[0]->id, 'order' => $entry[1]], $heroes)
        ];
    }
}
