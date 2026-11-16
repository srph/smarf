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

class BoardsShareTest extends TestCase
{
    // Tests run against the local MySQL database, so roll back instead of refreshing it.
    use DatabaseTransactions;

    public function test_boards_start_private()
    {
        $board = Board::factory()->create(['user_id' => User::factory()->create()->id]);

        $this->assertFalse($board->fresh()->is_public);
    }

    public function test_the_owner_opens_a_private_board_with_its_owner()
    {
        $owner = User::factory()->create();
        $board = Board::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($owner, ['*'], 'api');

        $this->getJson("/api/boards/{$board->id}")
            ->assertOk()
            ->assertJsonPath('board.is_public', false)
            ->assertJsonPath('board.user_id', $owner->id)
            ->assertJsonPath('board.owner', ['id' => $owner->id, 'name' => $owner->name, 'avatar' => $owner->avatar]);
    }

    public function test_a_guest_gets_a_404_for_a_private_board()
    {
        $board = Board::factory()->create(['user_id' => User::factory()->create()->id]);

        $this->getJson("/api/boards/{$board->id}")->assertNotFound();
    }

    public function test_another_user_gets_a_404_for_a_private_board()
    {
        $board = Board::factory()->create(['user_id' => User::factory()->create()->id]);
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        $this->getJson("/api/boards/{$board->id}")->assertNotFound();
    }

    public function test_a_guest_opens_a_public_board_with_its_heroes_and_owner()
    {
        $owner = User::factory()->create();
        $board = Board::factory()->create(['user_id' => $owner->id, 'is_public' => true]);
        $category = Category::factory()->create(['board_id' => $board->id]);
        $hero = Hero::first();
        $category->heroes()->attach($hero->id, ['id' => Str::orderedUuid(), 'order' => 1]);

        $response = $this->getJson("/api/boards/{$board->id}")
            ->assertOk()
            ->assertJsonPath('board.categories.0.heroes.0.id', $hero->id);

        // Only the owner's id, name and avatar
        $this->assertSame(['id', 'name', 'avatar'], array_keys($response->json('board.owner')));
        $this->assertSame($owner->name, $response->json('board.owner.name'));
    }

    public function test_another_user_opens_a_public_board()
    {
        $board = Board::factory()->create(['user_id' => User::factory()->create()->id, 'is_public' => true]);
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        $this->getJson("/api/boards/{$board->id}")->assertOk()->assertJsonPath('board.id', $board->id);
    }

    public function test_the_owner_makes_a_board_public_and_private_again()
    {
        $owner = User::factory()->create();
        $board = Board::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($owner, ['*'], 'api');

        $this->putJson("/api/boards/{$board->id}/public", ['is_public' => true])
            ->assertOk()
            ->assertJsonPath('board.is_public', true);
        $this->assertTrue($board->fresh()->is_public);

        $this->putJson("/api/boards/{$board->id}/public", ['is_public' => false])->assertOk();
        $this->assertFalse($board->fresh()->is_public);
    }

    public function test_only_the_owner_can_publish()
    {
        $board = Board::factory()->create(['user_id' => User::factory()->create()->id]);
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        $this->putJson("/api/boards/{$board->id}/public", ['is_public' => true])->assertForbidden();
        $this->assertFalse($board->fresh()->is_public);
    }

    public function test_publishing_needs_is_public()
    {
        $owner = User::factory()->create();
        $board = Board::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($owner, ['*'], 'api');

        $this->putJson("/api/boards/{$board->id}/public", [])->assertUnprocessable();
    }

    public function test_a_copy_of_a_public_board_belongs_to_the_copier_and_starts_private()
    {
        $board = Board::factory()->create([
            'user_id' => User::factory()->create()->id,
            'is_public' => true,
            'is_favorite' => true,
            'favorited_at' => now()
        ]);
        Category::factory()->create(['board_id' => $board->id, 'color' => 'amber']);
        $copier = User::factory()->create();
        Sanctum::actingAs($copier, ['*'], 'api');

        $id = $this->postJson("/api/boards/{$board->id}/duplicate")->assertOk()->json('board.id');

        $copy = Board::find($id);
        $this->assertSame($copier->id, $copy->user_id);
        $this->assertFalse($copy->is_public);
        $this->assertFalse($copy->is_favorite);
        $this->assertNull($copy->favorited_at);
        $this->assertSame(1, $copy->categories()->count());
        $this->assertSame('amber', $copy->categories()->first()->color);
    }

    public function test_a_private_board_cant_be_copied_by_another_user()
    {
        $board = Board::factory()->create(['user_id' => User::factory()->create()->id]);
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        $this->postJson("/api/boards/{$board->id}/duplicate")->assertNotFound();
    }

    public function test_a_guest_cant_copy_a_public_board()
    {
        $board = Board::factory()->create(['user_id' => User::factory()->create()->id, 'is_public' => true]);

        $this->postJson("/api/boards/{$board->id}/duplicate")->assertUnauthorized();
    }
}
