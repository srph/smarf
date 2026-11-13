<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Laravel\Passport\ClientRepository;
use Tests\TestCase;

use App\Models\User;

class DiscordAuthTest extends TestCase
{
    // Tests run against the local MySQL database, so roll back instead of refreshing it.
    use DatabaseTransactions;

    private const REDIRECT = 'http://mbp:13000/login/discord';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.discord.client_id' => 'discord-client',
            'services.discord.client_secret' => 'discord-secret',
        ]);

        // Tokens are personal access tokens, which need a personal access client.
        app(ClientRepository::class)->createPersonalAccessClient(null, 'Test Personal Access Client', 'http://localhost');
    }

    public function test_creates_a_user_and_returns_a_token_that_works()
    {
        $this->fakeDiscord(['id' => '1001', 'username' => 'pudge', 'global_name' => 'Pudge', 'avatar' => 'abc', 'email' => 'pudge@example.com', 'verified' => true]);

        $token = $this->postJson('/api/auth/discord', ['code' => 'the-code', 'redirect_uri' => self::REDIRECT])
            ->assertOk()
            ->json('access_token');

        $user = User::where('discord_id', '1001')->firstOrFail();
        $this->assertSame('Pudge', $user->name);
        $this->assertSame('pudge@example.com', $user->email);
        $this->assertNull($user->password);
        $this->assertSame('https://cdn.discordapp.com/avatars/1001/abc.png?size=128', $user->avatar);

        Http::assertSent(fn (Request $request) => $request->url() === 'https://discord.com/api/oauth2/token'
            && $request['code'] === 'the-code'
            && $request['redirect_uri'] === self::REDIRECT
            && $request['client_secret'] === 'discord-secret');

        $this->getJson('/api/auth/me', ['Authorization' => "Bearer $token"])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_signs_in_the_user_already_linked_to_the_discord_account()
    {
        $user = User::factory()->create(['discord_id' => '1002', 'email' => 'old@example.com']);
        $this->fakeDiscord(['id' => '1002', 'username' => 'axe', 'avatar' => null, 'email' => 'new@example.com', 'verified' => true]);

        $this->postJson('/api/auth/discord', ['code' => 'c', 'redirect_uri' => self::REDIRECT])->assertOk();

        $this->assertSame(1, User::where('discord_id', '1002')->count());
        $this->assertSame('old@example.com', $user->fresh()->email);
    }

    public function test_links_an_existing_account_with_the_same_verified_email()
    {
        $user = User::factory()->create(['email' => 'lina@example.com', 'avatar' => 'https://example.com/me.png']);
        $this->fakeDiscord(['id' => '1003', 'username' => 'lina', 'avatar' => 'xyz', 'email' => 'lina@example.com', 'verified' => true]);

        $this->postJson('/api/auth/discord', ['code' => 'c', 'redirect_uri' => self::REDIRECT])->assertOk();

        $user->refresh();
        $this->assertSame('1003', $user->discord_id);
        // An avatar that didn't come from Discord stays.
        $this->assertSame('https://example.com/me.png', $user->avatar);
    }

    public function test_an_unverified_email_is_neither_linked_nor_stored()
    {
        $existing = User::factory()->create(['email' => 'mirana@example.com']);
        $this->fakeDiscord(['id' => '1004', 'username' => 'mirana', 'avatar' => null, 'email' => 'mirana@example.com', 'verified' => false]);

        $this->postJson('/api/auth/discord', ['code' => 'c', 'redirect_uri' => self::REDIRECT])->assertOk();

        $this->assertNull($existing->fresh()->discord_id);
        $this->assertNull(User::where('discord_id', '1004')->firstOrFail()->email);
    }

    public function test_a_code_discord_rejects_is_a_validation_error()
    {
        Http::fake(['discord.com/api/oauth2/token' => Http::response(['error' => 'invalid_grant'], 400)]);

        $this->postJson('/api/auth/discord', ['code' => 'used', 'redirect_uri' => self::REDIRECT])
            ->assertStatus(422)
            ->assertJsonValidationErrors('code');
    }

    public function test_requires_a_code_and_redirect_uri()
    {
        $this->postJson('/api/auth/discord', [])->assertStatus(422)->assertJsonValidationErrors(['code', 'redirect_uri']);
    }

    private function fakeDiscord(array $profile)
    {
        Http::fake([
            'discord.com/api/oauth2/token' => Http::response(['access_token' => 'discord-token', 'token_type' => 'Bearer']),
            'discord.com/api/users/@me' => Http::response($profile),
        ]);
    }
}
