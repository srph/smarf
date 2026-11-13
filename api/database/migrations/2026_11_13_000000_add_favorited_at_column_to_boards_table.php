<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
            // When the board was last favorited; null when it isn't a favorite. The UI lists the latest favorite first.
            $table->timestamp('favorited_at')->nullable()->after('is_favorite');
        });

        // Existing favorites never recorded when they were favorited; their last update is the closest guess.
        DB::table('boards')->where('is_favorite', true)->update(['favorited_at' => DB::raw('updated_at')]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('boards', function (Blueprint $table) {
            $table->dropColumn('favorited_at');
        });
    }
};
