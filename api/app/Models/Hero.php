<?php

namespace App\Models;

use App\Traits\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hero extends Model
{
    use HasFactory, Uuid;

    /**
     * The model's default values for attributes.
     *
     * @var array
     */
    protected $attributes = [
        'thumbnail' => 'https://caretv.sgp1.cdn.digitaloceanspaces.com/app-smarf/heroes/hero.png',
    ];

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'attribute',
        'trhumbnail'
    ];

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }
}
