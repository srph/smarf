<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Hero;

return new class extends Migration
{
    // From `artisan smarf:hero` (OpenDota's primary_attr "all" is "universal"): the heroes whose attribute
    // changed since the last hero migration, and the heroes it didn't have.
    protected $changed = [
        [
            "name" => "Bane",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bane.png"
        ],
        [
            "name" => "Sand King",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/sand_king.png"
        ],
        [
            "name" => "Windranger",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/windrunner.png"
        ],
        [
            "name" => "Enigma",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/enigma.png"
        ],
        [
            "name" => "Beastmaster",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/beastmaster.png"
        ],
        [
            "name" => "Venomancer",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/venomancer.png"
        ],
        [
            "name" => "Death Prophet",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/death_prophet.png"
        ],
        [
            "name" => "Dazzle",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/dazzle.png"
        ],
        [
            "name" => "Nature's Prophet",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/furion.png"
        ],
        [
            "name" => "Batrider",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/batrider.png"
        ],
        [
            "name" => "Brewmaster",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/brewmaster.png"
        ],
        [
            "name" => "Ogre Magi",
            "attribute" => "strength",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ogre_magi.png"
        ],
        [
            "name" => "Nyx Assassin",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/nyx_assassin.png"
        ],
        [
            "name" => "Io",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/wisp.png"
        ],
        [
            "name" => "Visage",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/visage.png"
        ],
        [
            "name" => "Magnus",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/magnataur.png"
        ],
        [
            "name" => "Abaddon",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/abaddon.png"
        ],
        [
            "name" => "Techies",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/techies.png"
        ],
        [
            "name" => "Arc Warden",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/arc_warden.png"
        ],
        [
            "name" => "Pangolier",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pangolier.png"
        ],
        [
            "name" => "Void Spirit",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/void_spirit.png"
        ],
        [
            "name" => "Snapfire",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/snapfire.png"
        ],
        [
            "name" => "Marci",
            "attribute" => "universal",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/marci.png"
        ]
    ];

    protected $added = [
        [
            "name" => "Ringmaster",
            "attribute" => "intelligence",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/ringmaster.png"
        ],
        [
            "name" => "Muerta",
            "attribute" => "intelligence",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/muerta.png"
        ],
        [
            "name" => "Kez",
            "attribute" => "agility",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/kez.png"
        ],
        [
            "name" => "Largo",
            "attribute" => "strength",
            "thumbnail" => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/largo.png"
        ]
    ];

    // The attributes the changed heroes had before, for down()
    protected $previous = [
        "Bane" => "intelligence",
        "Sand King" => "strength",
        "Windranger" => "intelligence",
        "Enigma" => "intelligence",
        "Beastmaster" => "strength",
        "Venomancer" => "agility",
        "Death Prophet" => "intelligence",
        "Dazzle" => "intelligence",
        "Nature's Prophet" => "intelligence",
        "Batrider" => "intelligence",
        "Brewmaster" => "strength",
        "Ogre Magi" => "intelligence",
        "Nyx Assassin" => "agility",
        "Io" => "strength",
        "Visage" => "intelligence",
        "Magnus" => "strength",
        "Abaddon" => "strength",
        "Techies" => "intelligence",
        "Arc Warden" => "agility",
        "Pangolier" => "agility",
        "Void Spirit" => "intelligence",
        "Snapfire" => "strength",
        "Marci" => "strength"
    ];

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("ALTER TABLE heroes MODIFY attribute ENUM('strength', 'agility', 'intelligence', 'universal') NOT NULL");

        // Matched by name, so existing heroes keep their ids and every board keeps its heroes.
        collect($this->changed)->each(fn ($hero) => Hero::where('name', $hero['name'])->update(['attribute' => $hero['attribute']]));

        collect($this->added)->each(fn ($hero) => Hero::firstOrCreate(['name' => $hero['name']], $hero));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $added = Hero::whereIn('name', array_column($this->added, 'name'))->pluck('id');

        // The added heroes leave every category they were placed in.
        DB::table('category_hero')->whereIn('hero_id', $added)->delete();
        Hero::whereIn('id', $added)->delete();

        collect($this->previous)->each(fn ($attribute, $name) => Hero::where('name', $name)->update(['attribute' => $attribute]));

        DB::statement("ALTER TABLE heroes MODIFY attribute ENUM('strength', 'agility', 'intelligence') NOT NULL");
    }
};
