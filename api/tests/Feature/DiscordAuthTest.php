<?php

namespace Tests\Feature;

use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Psr7\Request as Psr7Request;
use GuzzleHttp\Psr7\Response as Psr7Response;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Passport\ClientRepository;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as DiscordUser;
use Mockery;
use Tests\TestCase;

use App\Models\User;

class DiscordAuthTest extends TestCase
{
    // Tests run against a MySQL database, so roll back instead of refreshing it.
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

    public function test_creates_the_user_and_returns_a_token_that_works()
    {
        $provider = $this->fakeDiscord([
            'id' => '1001', 'username' => 'pudge', 'global_name' => 'Pudge', 'email' => 'pudge@example.com', 'verified' => true,
            'avatar' => 'https://cdn.discordapp.com/avatars/1001/abc.png',
        ]);

        $token = $this->postJson('/api/auth/discord', ['code' => 'the-code', 'redirect_uri' => self::REDIRECT])
            ->assertOk()
            ->json('access_token');

        $provider->shouldHaveReceived('redirectUrl')->with(self::REDIRECT);

        $user = User::where('discord_id', '1001')->firstOrFail();
        $this->assertSame('Pudge', $user->name);
        $this->assertSame('pudge@example.com', $user->email);
        $this->assertSame('https://cdn.discordapp.com/avatars/1001/abc.png', $user->avatar);

        $this->getJson('/api/auth/me', ['Authorization' => "Bearer $token"])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_signs_in_the_same_user_again_and_follows_their_discord_profile()
    {
        $user = User::factory()->create(['discord_id' => '1002', 'name' => 'Old name']);
        $this->fakeDiscord(['id' => '1002', 'username' => 'axe', 'global_name' => null, 'email' => null, 'verified' => false, 'avatar' => null]);

        $this->postJson('/api/auth/discord', ['code' => 'c', 'redirect_uri' => self::REDIRECT])->assertOk();

        $this->assertSame(1, User::where('discord_id', '1002')->count());
        // No display name: falls back to the username.
        $this->assertSame('axe', $user->fresh()->name);
    }

    public function test_an_unverified_email_is_not_stored()
    {
        $this->fakeDiscord(['id' => '1003', 'username' => 'lina', 'email' => 'lina@example.com', 'verified' => false, 'avatar' => null]);

        $this->postJson('/api/auth/discord', ['code' => 'c', 'redirect_uri' => self::REDIRECT])->assertOk();

        $this->assertNull(User::where('discord_id', '1003')->firstOrFail()->email);
    }

    public function test_a_code_discord_rejects_is_a_validation_error()
    {
        $provider = $this->discordProvider();
        $provider->shouldReceive('user')->andThrow(
            new ClientException('invalid_grant', new Psr7Request('POST', 'https://discord.com/api/oauth2/token'), new Psr7Response(400))
        );

        $this->postJson('/api/auth/discord', ['code' => 'used', 'redirect_uri' => self::REDIRECT])
            ->assertStatus(422)
            ->assertJsonValidationErrors('code');
    }

    public function test_requires_a_code_and_redirect_uri()
    {
        $this->postJson('/api/auth/discord', [])->assertStatus(422)->assertJsonValidationErrors(['code', 'redirect_uri']);
    }

    public function test_is_unavailable_until_discord_is_configured()
    {
        config(['services.discord.client_secret' => null]);

        $this->postJson('/api/auth/discord', ['code' => 'c', 'redirect_uri' => self::REDIRECT])->assertStatus(503);
    }

    /** Socialite's Discord driver, answering with this raw Discord profile. */
    private function fakeDiscord(array $profile)
    {
        $user = (new DiscordUser())->setRaw($profile)->map([
            'id' => $profile['id'],
            'nickname' => $profile['username'],
            'name' => $profile['username'],
            'email' => $profile['email'],
            'avatar' => $profile['avatar'],
        ]);

        $provider = $this->discordProvider();
        $provider->shouldReceive('user')->andReturn($user);

        return $provider;
    }

    private function discordProvider()
    {
        $provider = Mockery::spy(\SocialiteProviders\Discord\Provider::class);
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('redirectUrl')->andReturnSelf();
        Socialite::shouldReceive('driver')->with('discord')->andReturn($provider);

        return $provider;
    }
}
