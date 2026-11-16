<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

use App\Models\Board;
use App\Models\Category;
use App\Models\User;

class CategoriesUpdateTest extends TestCase
{
    // Tests run against the local MySQL database, so roll back instead of refreshing it.
    use DatabaseTransactions;

    public function test_categories_start_without_a_color()
    {
        $category = $this->category(User::factory()->create());

        $this->assertNull($category->fresh()->color);
    }

    public function test_the_owner_sets_each_color()
    {
        $owner = User::factory()->create();
        $category = $this->category($owner);
        Sanctum::actingAs($owner, ['*'], 'api');

        foreach (Category::COLORS as $color) {
            $this->putJson("/api/categories/{$category->id}", ['color' => $color])->assertOk();

            $this->assertSame($color, $category->fresh()->color);
        }
    }

    public function test_a_null_color_clears_it()
    {
        $owner = User::factory()->create();
        $category = $this->category($owner, ['color' => 'red']);
        Sanctum::actingAs($owner, ['*'], 'api');

        $this->putJson("/api/categories/{$category->id}", ['color' => null])->assertOk();

        $this->assertNull($category->fresh()->color);
    }

    public function test_rejects_an_unknown_color()
    {
        $owner = User::factory()->create();
        $category = $this->category($owner, ['color' => 'red']);
        Sanctum::actingAs($owner, ['*'], 'api');

        $this->putJson("/api/categories/{$category->id}", ['color' => '#ff0000'])->assertUnprocessable();

        $this->assertSame('red', $category->fresh()->color);
    }

    public function test_a_rename_leaves_the_color_alone()
    {
        $owner = User::factory()->create();
        $category = $this->category($owner, ['color' => 'red']);
        Sanctum::actingAs($owner, ['*'], 'api');

        $this->putJson("/api/categories/{$category->id}", ['name' => 'S Tier'])->assertOk();

        $category->refresh();
        $this->assertSame('S Tier', $category->name);
        $this->assertSame('red', $category->color);
    }

    public function test_another_user_cant_set_the_color()
    {
        $category = $this->category(User::factory()->create());
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        $this->putJson("/api/categories/{$category->id}", ['color' => 'red'])->assertForbidden();

        $this->assertNull($category->fresh()->color);
    }

    public function test_the_board_returns_each_categorys_color()
    {
        $owner = User::factory()->create();
        $category = $this->category($owner, ['color' => 'emerald']);
        Sanctum::actingAs($owner, ['*'], 'api');

        $this->getJson("/api/boards/{$category->board_id}")
            ->assertOk()
            ->assertJsonPath('board.categories.0.color', 'emerald');
    }

    /** A category on a board of $owner's. */
    protected function category(User $owner, array $attributes = []): Category
    {
        $board = Board::factory()->create(['user_id' => $owner->id]);

        return Category::factory()->create(['board_id' => $board->id] + $attributes);
    }
}
