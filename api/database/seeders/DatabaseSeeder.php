<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Truncate all tables
     * 
     * @return void
     */
    protected function truncate()
    {
        User::truncate();
    }

    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->truncate();

        User::factory()->count(1)
            ->admin()
            ->create();
    }
}
