<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Hero;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Generated from `artisan smarf:hero`

        $heroes = collect([
            [
                "name" => "Anti-Mage",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/antimage_full.png"
            ],
            [
                "name" => "Axe",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/axe_full.png"
            ],
            [
                "name" => "Bane",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/bane_full.png"
            ],
            [
                "name" => "Bloodseeker",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/bloodseeker_full.png"
            ],
            [
                "name" => "Crystal Maiden",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/crystal_maiden_full.png"
            ],
            [
                "name" => "Drow Ranger",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/drow_ranger_full.png"
            ],
            [
                "name" => "Earthshaker",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/earthshaker_full.png"
            ],
            [
                "name" => "Juggernaut",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/juggernaut_full.png"
            ],
            [
                "name" => "Mirana",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/mirana_full.png"
            ],
            [
                "name" => "Morphling",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/morphling_full.png"
            ],
            [
                "name" => "Shadow Fiend",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/nevermore_full.png"
            ],
            [
                "name" => "Phantom Lancer",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/phantom_lancer_full.png"
            ],
            [
                "name" => "Puck",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/puck_full.png"
            ],
            [
                "name" => "Pudge",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/pudge_full.png"
            ],
            [
                "name" => "Razor",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/razor_full.png"
            ],
            [
                "name" => "Sand King",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/sand_king_full.png"
            ],
            [
                "name" => "Storm Spirit",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/storm_spirit_full.png"
            ],
            [
                "name" => "Sven",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/sven_full.png"
            ],
            [
                "name" => "Tiny",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/tiny_full.png"
            ],
            [
                "name" => "Vengeful Spirit",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/vengefulspirit_full.png"
            ],
            [
                "name" => "Windranger",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/windrunner_full.png"
            ],
            [
                "name" => "Zeus",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/zuus_full.png"
            ],
            [
                "name" => "Kunkka",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/kunkka_full.png"
            ],
            [
                "name" => "Lina",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/lina_full.png"
            ],
            [
                "name" => "Lion",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/lion_full.png"
            ],
            [
                "name" => "Shadow Shaman",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/shadow_shaman_full.png"
            ],
            [
                "name" => "Slardar",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/slardar_full.png"
            ],
            [
                "name" => "Tidehunter",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/tidehunter_full.png"
            ],
            [
                "name" => "Witch Doctor",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/witch_doctor_full.png"
            ],
            [
                "name" => "Lich",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/lich_full.png"
            ],
            [
                "name" => "Riki",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/riki_full.png"
            ],
            [
                "name" => "Enigma",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/enigma_full.png"
            ],
            [
                "name" => "Tinker",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/tinker_full.png"
            ],
            [
                "name" => "Sniper",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/sniper_full.png"
            ],
            [
                "name" => "Necrophos",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/necrolyte_full.png"
            ],
            [
                "name" => "Warlock",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/warlock_full.png"
            ],
            [
                "name" => "Beastmaster",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/beastmaster_full.png"
            ],
            [
                "name" => "Queen of Pain",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/queenofpain_full.png"
            ],
            [
                "name" => "Venomancer",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/venomancer_full.png"
            ],
            [
                "name" => "Faceless Void",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/faceless_void_full.png"
            ],
            [
                "name" => "Wraith King",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/skeleton_king_full.png"
            ],
            [
                "name" => "Death Prophet",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/death_prophet_full.png"
            ],
            [
                "name" => "Phantom Assassin",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/phantom_assassin_full.png"
            ],
            [
                "name" => "Pugna",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/pugna_full.png"
            ],
            [
                "name" => "Templar Assassin",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/templar_assassin_full.png"
            ],
            [
                "name" => "Viper",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/viper_full.png"
            ],
            [
                "name" => "Luna",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/luna_full.png"
            ],
            [
                "name" => "Dragon Knight",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/dragon_knight_full.png"
            ],
            [
                "name" => "Dazzle",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/dazzle_full.png"
            ],
            [
                "name" => "Clockwerk",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/rattletrap_full.png"
            ],
            [
                "name" => "Leshrac",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/leshrac_full.png"
            ],
            [
                "name" => "Nature's Prophet",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/furion_full.png"
            ],
            [
                "name" => "Lifestealer",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/life_stealer_full.png"
            ],
            [
                "name" => "Dark Seer",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/dark_seer_full.png"
            ],
            [
                "name" => "Clinkz",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/clinkz_full.png"
            ],
            [
                "name" => "Omniknight",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/omniknight_full.png"
            ],
            [
                "name" => "Enchantress",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/enchantress_full.png"
            ],
            [
                "name" => "Huskar",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/huskar_full.png"
            ],
            [
                "name" => "Night Stalker",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/night_stalker_full.png"
            ],
            [
                "name" => "Broodmother",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/broodmother_full.png"
            ],
            [
                "name" => "Bounty Hunter",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/bounty_hunter_full.png"
            ],
            [
                "name" => "Weaver",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/weaver_full.png"
            ],
            [
                "name" => "Jakiro",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/jakiro_full.png"
            ],
            [
                "name" => "Batrider",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/batrider_full.png"
            ],
            [
                "name" => "Chen",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/chen_full.png"
            ],
            [
                "name" => "Spectre",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/spectre_full.png"
            ],
            [
                "name" => "Ancient Apparition",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/ancient_apparition_full.png"
            ],
            [
                "name" => "Doom",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/doom_bringer_full.png"
            ],
            [
                "name" => "Ursa",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/ursa_full.png"
            ],
            [
                "name" => "Spirit Breaker",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/spirit_breaker_full.png"
            ],
            [
                "name" => "Gyrocopter",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/gyrocopter_full.png"
            ],
            [
                "name" => "Alchemist",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/alchemist_full.png"
            ],
            [
                "name" => "Invoker",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/invoker_full.png"
            ],
            [
                "name" => "Silencer",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/silencer_full.png"
            ],
            [
                "name" => "Outworld Destroyer",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/obsidian_destroyer_full.png"
            ],
            [
                "name" => "Lycan",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/lycan_full.png"
            ],
            [
                "name" => "Brewmaster",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/brewmaster_full.png"
            ],
            [
                "name" => "Shadow Demon",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/shadow_demon_full.png"
            ],
            [
                "name" => "Lone Druid",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/lone_druid_full.png"
            ],
            [
                "name" => "Chaos Knight",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/chaos_knight_full.png"
            ],
            [
                "name" => "Meepo",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/meepo_full.png"
            ],
            [
                "name" => "Treant Protector",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/treant_full.png"
            ],
            [
                "name" => "Ogre Magi",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/ogre_magi_full.png"
            ],
            [
                "name" => "Undying",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/undying_full.png"
            ],
            [
                "name" => "Rubick",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/rubick_full.png"
            ],
            [
                "name" => "Disruptor",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/disruptor_full.png"
            ],
            [
                "name" => "Nyx Assassin",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/nyx_assassin_full.png"
            ],
            [
                "name" => "Naga Siren",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/naga_siren_full.png"
            ],
            [
                "name" => "Keeper of the Light",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/keeper_of_the_light_full.png"
            ],
            [
                "name" => "Io",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/wisp_full.png"
            ],
            [
                "name" => "Visage",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/visage_full.png"
            ],
            [
                "name" => "Slark",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/slark_full.png"
            ],
            [
                "name" => "Medusa",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/medusa_full.png"
            ],
            [
                "name" => "Troll Warlord",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/troll_warlord_full.png"
            ],
            [
                "name" => "Centaur Warrunner",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/centaur_full.png"
            ],
            [
                "name" => "Magnus",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/magnataur_full.png"
            ],
            [
                "name" => "Timbersaw",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/shredder_full.png"
            ],
            [
                "name" => "Bristleback",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/bristleback_full.png"
            ],
            [
                "name" => "Tusk",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/tusk_full.png"
            ],
            [
                "name" => "Skywrath Mage",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/skywrath_mage_full.png"
            ],
            [
                "name" => "Abaddon",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/abaddon_full.png"
            ],
            [
                "name" => "Elder Titan",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/elder_titan_full.png"
            ],
            [
                "name" => "Legion Commander",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/legion_commander_full.png"
            ],
            [
                "name" => "Techies",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/techies_full.png"
            ],
            [
                "name" => "Ember Spirit",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/ember_spirit_full.png"
            ],
            [
                "name" => "Earth Spirit",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/earth_spirit_full.png"
            ],
            [
                "name" => "Underlord",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/abyssal_underlord_full.png"
            ],
            [
                "name" => "Terrorblade",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/terrorblade_full.png"
            ],
            [
                "name" => "Phoenix",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/phoenix_full.png"
            ],
            [
                "name" => "Oracle",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/oracle_full.png"
            ],
            [
                "name" => "Winter Wyvern",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/winter_wyvern_full.png"
            ],
            [
                "name" => "Arc Warden",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/arc_warden_full.png"
            ],
            [
                "name" => "Monkey King",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/monkey_king_full.png"
            ],
            [
                "name" => "Dark Willow",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/dark_willow_full.png"
            ],
            [
                "name" => "Pangolier",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/pangolier_full.png"
            ],
            [
                "name" => "Grimstroke",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/grimstroke_full.png"
            ],
            [
                "name" => "Hoodwink",
                "attribute" => "agility",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/hoodwink_full.png"
            ],
            [
                "name" => "Void Spirit",
                "attribute" => "intelligence",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/void_spirit_full.png"
            ],
            [
                "name" => "Snapfire",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/snapfire_full.png"
            ],
            [
                "name" => "Mars",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/mars_full.png"
            ],
            [
                "name" => "Dawnbreaker",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/dawnbreaker_full.png"
            ],
            [
                "name" => "Marci",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/marci_full.png"
            ],
            [
                "name" => "Primal Beast",
                "attribute" => "strength",
                "thumbnail" => "https://cdn.dota2.com/apps/dota2/images/heroes/primal_beast_full.png"
            ]
        ]);

        $heroes->each(fn ($hero) => Hero::create($hero));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Hero::truncate();
    }
};
