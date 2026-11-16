<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

use App\Models\Board;
use App\Models\User;

class BoardsSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_new_board_gets_a_six_character_slug_from_the_alphabet()
    {
        $board = Board::factory()->create(['user_id' => User::factory()->create()->id]);

        $this->assertMatchesRegularExpression('/^[' . Board::SLUG_ALPHABET . ']{6}$/', $board->slug);
    }

    public function test_a_board_is_found_by_its_slug_not_its_id()
    {
        $owner = User::factory()->create();
        $board = Board::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($owner, ['*'], 'api');

        $this->getJson("/api/boards/{$board->slug}")->assertOk()->assertJsonPath('board.slug', $board->slug);
        $this->getJson("/api/boards/{$board->id}")->assertNotFound();
    }

    public function test_slugs_are_case_sensitive()
    {
        $owner = User::factory()->create();
        $lower = Board::factory()->create(['user_id' => $owner->id, 'slug' => 'bcdfgh']);
        $upper = Board::factory()->create(['user_id' => $owner->id, 'slug' => 'BCDFGH']);
        Sanctum::actingAs($owner, ['*'], 'api');

        $this->getJson('/api/boards/bcdfgh')->assertOk()->assertJsonPath('board.id', $lower->id);
        $this->getJson('/api/boards/BCDFGH')->assertOk()->assertJsonPath('board.id', $upper->id);
        $this->getJson('/api/boards/bCdFgH')->assertNotFound();
    }

    public function test_a_copy_gets_its_own_slug()
    {
        $owner = User::factory()->create();
        $board = Board::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($owner, ['*'], 'api');

        $slug = $this->postJson("/api/boards/{$board->slug}/duplicate")->assertOk()->json('board.slug');

        $this->assertNotNull($slug);
        $this->assertNotSame($board->slug, $slug);
    }
}
