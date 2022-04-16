<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Hero;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Hero>
 */
class HeroFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Hero::class;
    
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'id' => $this->faker->uuid(),
            'name' => $this->faker->name,
            'thumbnail' => 'thumbnail.jpeg',
        ];
    }
}
