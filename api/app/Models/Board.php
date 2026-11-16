<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\Uuid;

class Board extends Model
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

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'is_favorite',
        'favorited_at',
        'is_public'
    ];

    /**
     * MySQL stores is_favorite and is_public as tinyint(1); the casts send them as true/false (or null), matching `Board`
     * in ui/src/types/api.ts. favorited_at goes out as an ISO 8601 string, like created_at.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_favorite' => 'boolean',
        'favorited_at' => 'datetime',
        'is_public' => 'boolean'
    ];

    /**
     * What a slug is made of: mixed case and digits, without vowels (so a slug can't spell a word) or the characters
     * that read alike (0/O, 1/l/I). 49 characters, so about 13.8 billion six-character slugs.
     */
    public const SLUG_ALPHABET = 'bcdfghjkmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ23456789';

    protected static function booted()
    {
        static::creating(function (Board $board) {
            // A copy comes from replicate(['slug']), so it gets its own.
            $board->slug ??= static::newSlug();
        });
    }

    /**
     * A random slug no board has. The unique index on boards.slug backs this up if two boards draw the same one at
     * once.
     */
    public static function newSlug(): string
    {
        do {
            $slug = collect(range(1, 6))
                ->map(fn () => self::SLUG_ALPHABET[random_int(0, strlen(self::SLUG_ALPHABET) - 1)])
                ->implode('');
        } while (static::where('slug', $slug)->exists());

        return $slug;
    }

    /**
     * Boards are found by slug in URLs (boards/{board}), not by id.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * The user who made the board. Load it as `owner:id,name,avatar`: a visitor to a public board sees only that.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user()
    {
        return $this->hasMany(User::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }
}
