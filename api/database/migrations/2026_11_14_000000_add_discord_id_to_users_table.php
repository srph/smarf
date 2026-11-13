<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Discord sign-in: link a user to their Discord account. Someone who only ever signs in with
     * Discord has no password, and no email if Discord's isn't verified.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('discord_id')->nullable()->unique()->after('id');
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['discord_id']);
            $table->dropColumn('discord_id');
            $table->string('email')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
        });
    }
};
