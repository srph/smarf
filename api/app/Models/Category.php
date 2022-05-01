<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\Uuid;

class Category extends Model
{
    use HasFactory, Uuid;

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function heroes()
    {
        return $this->belongsToMany(Hero::class)
            ->orderBy('order')
            ->withPivot('id', 'order');
    }
}
