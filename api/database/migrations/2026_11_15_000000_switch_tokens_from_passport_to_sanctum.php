<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sign-in tokens move from Passport to Sanctum. Sanctum's table was made for integer ids, but users
     * have UUIDs, so it's rebuilt with a UUID tokenable_id (it never held a token). Passport's tables go:
     * their migrations are gone, so this only matters for databases made before the switch.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('personal_access_tokens');

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->uuidMorphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });

        foreach (['oauth_auth_codes', 'oauth_access_tokens', 'oauth_refresh_tokens', 'oauth_clients', 'oauth_personal_access_clients'] as $table) {
            Schema::dropIfExists($table);
        }
    }

    /**
     * Back to Sanctum's original table. Passport's tables aren't restored: Passport is no longer installed.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('personal_access_tokens');

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }
};
