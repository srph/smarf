<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CreateAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'smarf:admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an administrator account';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $email = $this->askName();

        $password = $this->ask('What password should we set?');

        User::create([
            'email' => $email,
            'password' => bcrypt($password)
        ]);

        $this->info('Admin user with email "{$email} was created successfully.');

        return 0;
    }

    protected function askName()
    {
        $email = $this->ask('What name should we set? (e.g., hi@admin.com)');

        if (User::where('email', $email)->exists()) {
            $this->error('An account with the email "{$email}" already exists.');
            return $this->askName();
        }

        return $email;
    }
}
