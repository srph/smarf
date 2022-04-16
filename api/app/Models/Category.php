<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    public function board() {
        return $this->belongsTo(Board::class);
    }

    public function heroes() {
        return $this->belongsToMany(Hero::class);
    }
}
