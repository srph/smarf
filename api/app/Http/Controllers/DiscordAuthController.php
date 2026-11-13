<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Laravel\Passport\PersonalAccessTokenFactory;
use App\Models\User;

class DiscordAuthController extends Controller
{
    private const API = 'https://discord.com/api';

    /**
     * Sign in with Discord. The UI sends the code Discord gave it (and the redirect_uri it used, which
     * Discord checks again); we trade it for the Discord user, find or create the matching Smarf user,
     * and answer with a Passport token the same shape as the password grant's.
     */
    public function login(Request $request, PersonalAccessTokenFactory $tokens)
    {
        $request->validate([
            'code' => 'required|string',
            'redirect_uri' => 'required|url',
        ]);

        $clientId = config('services.discord.client_id');
        $clientSecret = config('services.discord.client_secret');

        abort_if(!$clientId || !$clientSecret, 503, 'Discord sign-in is not set up.');

        $token = Http::asForm()->timeout(10)->post(self::API . '/oauth2/token', [
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'grant_type' => 'authorization_code',
            'code' => $request->input('code'),
            'redirect_uri' => $request->input('redirect_uri'),
        ]);

        // A used, expired or mismatched code: the visitor can just try again.
        if ($token->clientError()) {
            throw ValidationException::withMessages(['code' => "Discord didn't accept the sign-in. Try again."]);
        }

        abort_unless($token->successful(), 502, "Couldn't reach Discord.");

        $profile = Http::withToken($token->json('access_token'))->timeout(10)->get(self::API . '/users/@me');

        abort_unless($profile->successful(), 502, "Couldn't reach Discord.");

        $user = $this->findOrCreateUser($profile->json());

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $tokens->make($user->getKey(), 'Discord')->accessToken,
        ]);
    }

    /**
     * The user already linked to this Discord account; else the user with the same (verified) email,
     * now linked; else a new user.
     */
    private function findOrCreateUser(array $discord): User
    {
        // An unverified email could belong to someone else, so it's neither matched nor stored.
        $email = ($discord['verified'] ?? false) ? ($discord['email'] ?? null) : null;

        $avatar = isset($discord['avatar'])
            ? "https://cdn.discordapp.com/avatars/{$discord['id']}/{$discord['avatar']}.png?size=128"
            : null;

        $user = User::where('discord_id', $discord['id'])->first()
            ?? ($email ? User::where('email', $email)->first() : null);

        if (!$user) {
            return User::create([
                'discord_id' => $discord['id'],
                'name' => $discord['global_name'] ?? $discord['username'],
                'email' => $email,
                'avatar' => $avatar,
            ]);
        }

        $user->discord_id = $discord['id'];

        // Keep the Discord avatar current, without replacing one that came from elsewhere.
        if (!$user->avatar || str_starts_with($user->avatar, 'https://cdn.discordapp.com/')) {
            $user->avatar = $avatar;
        }

        $user->save();

        return $user;
    }
}
