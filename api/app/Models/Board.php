<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;

    public function user() {
        return $this->hasMany(User::class);
    }

    public function categories() {
        return $this->hasMany(Category::class);
    }
}
