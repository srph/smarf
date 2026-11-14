<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class HeroesIndexTest extends TestCase
{
    // Tests run against the local MySQL database, so roll back instead of refreshing it.
    use DatabaseTransactions;

    public function test_lists_every_hero_by_name_with_universal_heroes()
    {
        $heroes = collect($this->getJson('/api/heroes')->assertOk()->json('heroes'));

        $this->assertSame($heroes->pluck('name')->sort()->values()->all(), $heroes->pluck('name')->all());
        $this->assertSame('universal', $heroes->firstWhere('name', 'Marci')['attribute']);
        $this->assertSame('strength', $heroes->firstWhere('name', 'Ogre Magi')['attribute']);

        // Heroes the earlier migrations didn't have
        $this->assertNotNull($heroes->firstWhere('name', 'Muerta'));
        $this->assertNotNull($heroes->firstWhere('name', 'Ringmaster'));
    }

    public function test_attributes_are_the_four_dota_ones()
    {
        $attributes = collect($this->getJson('/api/heroes')->json('heroes'))->pluck('attribute')->unique()->sort()->values()->all();

        $this->assertSame(['agility', 'intelligence', 'strength', 'universal'], $attributes);
    }
}
