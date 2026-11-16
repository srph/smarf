<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\Uuid;

class Category extends Model
{
    use HasFactory, Uuid;

    /**
     * The colours a category's card can take; a category without one is null. Keep in step with the UI's
     * ui/src/lib/category-colors.ts.
     *
     * @var array<int, string>
     */
    public const COLORS = ['red', 'orange', 'amber', 'emerald', 'cyan', 'blue', 'violet', 'pink'];

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

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'board_id',
        'name',
        'x_position',
        'y_position',
        'width',
        'height',
        'color'
    ];

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
