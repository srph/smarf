<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Collection;

class FetchHeroList extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'smarf:hero {--pretty}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate an array of heroes from the Open Dota API to be pasted into a migrations file';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $heroes = Http::get('https://api.opendota.com/api/heroes')->collect()
            ->map(function ($hero) {
                // Get thumbnail key based on prefixed name
                $name = str_replace('npc_dota_hero_', '', $hero['name']);

                return [
                    'name' => $hero['localized_name'],
                    'attribute' => match ($hero['primary_attr']) {
                        'str' => 'strength',
                        'agi' => 'agility',
                        'int' => 'intelligence'
                    },
                    'thumbnail' => "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/{$name}.png"

                ];
            });

        $this->info('Open Dota API (/api/heroes):');

        if ($this->option('pretty')) {
            $this->pretty($heroes);
        } else {
            $this->ugly($heroes);
        }

        return 0;
    }

    /**
     * Table output
     * 
     * @return void
     */
    protected function pretty(Collection $heroes)
    {
        $this->table(['Name', 'Attribute', 'Thumbnail'], $heroes->toArray());
    }

    /**
     * Output a copy-pastable PHP array for the migrations file
     * 
     * @return void
     */
    protected function ugly(Collection $heroes)
    {
        $json = json_encode($heroes->toArray(), JSON_PRETTY_PRINT);
        $json = str_replace('{', '[', $json);
        $json = str_replace('}', ']', $json);
        $json = str_replace('": "', '" => "', $json);
        $json = str_replace('\\/', '/', $json);
        $this->info($json);
    }
}
