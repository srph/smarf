<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

use App\Models\Board;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('boards', function (Blueprint $table) {
            // A board's link is /b/<slug>. ascii_bin, since the database's default collation ignores case: aB3xYz and
            // AB3XYZ would count as one slug.
            $table->char('slug', 6)->charset('ascii')->collation('ascii_bin')->nullable()->after('id');
        });

        // Any boards made before slugs get one, so the column can be required.
        DB::table('boards')->whereNull('slug')->pluck('id')->each(
            fn ($id) => DB::table('boards')->where('id', $id)->update(['slug' => Board::newSlug()])
        );

        DB::statement('ALTER TABLE boards MODIFY slug CHAR(6) CHARACTER SET ascii COLLATE ascii_bin NOT NULL');

        Schema::table('boards', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('boards', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
