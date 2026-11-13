<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

use App\Models\Board;
use App\Models\Category;
use App\Models\Hero;
use App\Models\User;

class HeroesRemoveTest extends TestCase
{
    // Tests run against the local MySQL database, so roll back instead of refreshing it.
    use DatabaseTransactions;

    public function test_removes_only_that_entry_and_saves_the_height()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*'], 'api');

        $category = $this->categoryFor($user, ['height' => 114]);
        $hero = Hero::first();

        // The same hero twice: removing one entry must leave the other.
        $first = $this->attach($category, $hero, 1);
        $second = $this->attach($category, $hero, 2);

        $this->deleteJson("/api/categories/{$category->id}/heroes/{$first}", ['category_height' => 61])
            ->assertOk();

        $this->assertSame([$second], $this->pivotIds($category));
        $this->assertEquals(61, $category->fresh()->height);
    }

    public function test_requires_the_new_height()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*'], 'api');

        $category = $this->categoryFor($user);
        $pivot = $this->attach($category, Hero::first(), 1);

        $this->deleteJson("/api/categories/{$category->id}/heroes/{$pivot}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('category_height');

        $this->assertSame([$pivot], $this->pivotIds($category));
    }

    public function test_cannot_remove_from_someone_elses_category()
    {
        Sanctum::actingAs(User::factory()->create(), ['*'], 'api');

        $category = $this->categoryFor(User::factory()->create());
        $pivot = $this->attach($category, Hero::first(), 1);

        $this->deleteJson("/api/categories/{$category->id}/heroes/{$pivot}", ['category_height' => 61])
            ->assertForbidden();

        $this->assertSame([$pivot], $this->pivotIds($category));
    }

    public function test_an_entry_from_another_category_is_not_found()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*'], 'api');

        $category = $this->categoryFor($user);
        $other = $this->categoryFor($user);
        $pivot = $this->attach($other, Hero::first(), 1);

        $this->deleteJson("/api/categories/{$category->id}/heroes/{$pivot}", ['category_height' => 61])
            ->assertNotFound();

        $this->assertSame([$pivot], $this->pivotIds($other));
    }

    private function categoryFor(User $user, array $attributes = []): Category
    {
        $board = Board::factory()->create(['user_id' => $user->id]);

        return Category::factory()->create(['board_id' => $board->id] + $attributes);
    }

    private function attach(Category $category, Hero $hero, int $order): string
    {
        $id = Str::orderedUuid()->toString();
        $category->heroes()->attach($hero->id, ['id' => $id, 'order' => $order]);

        return $id;
    }

    private function pivotIds(Category $category): array
    {
        return DB::table('category_hero')->where('category_id', $category->id)->orderBy('order')->pluck('id')->all();
    }
}
