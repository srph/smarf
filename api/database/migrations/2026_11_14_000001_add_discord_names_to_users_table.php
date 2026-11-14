<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Keeps both of Discord's names: the unique handle and the optional display name. Both are
     * nullable: users who signed in before this get them on their next sign-in.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('discord_username')->nullable()->after('discord_id');
            $table->string('discord_global_name')->nullable()->after('discord_username');
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['discord_username', 'discord_global_name']);
        });
    }
};
