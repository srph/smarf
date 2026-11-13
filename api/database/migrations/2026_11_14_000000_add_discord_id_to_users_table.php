<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sign-in is Discord-only: every user has a Discord id and none has a password. Email is only
     * kept when Discord has verified it. Needs an empty users table (discord_id is required).
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('discord_id')->unique()->after('id');
            $table->string('email')->nullable()->change();
            $table->dropColumn('password');
        });
    }

    /**
     * Password and email stay nullable going back: Discord users have no password to restore.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['discord_id']);
            $table->dropColumn('discord_id');
            $table->string('password')->nullable()->after('email_verified_at');
        });
    }
};
