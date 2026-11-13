<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Passport\PersonalAccessTokenFactory;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as DiscordUser;
use GuzzleHttp\Exception\ClientException;
use App\Models\User;

class DiscordAuthController extends Controller
{
    /**
     * Sign in with Discord. The UI sends the code Discord gave it, and the redirect_uri it used (Discord
     * checks it matches). Socialite trades the code for the Discord profile; we find or create that user
     * and answer with a Passport token.
     */
    public function login(Request $request, PersonalAccessTokenFactory $tokens)
    {
        $request->validate([
            'code' => 'required|string',
            'redirect_uri' => 'required|url',
        ]);

        abort_if(
            !config('services.discord.client_id') || !config('services.discord.client_secret'),
            503,
            'Discord sign-in is not set up.'
        );

        try {
            // Socialite reads `code` from the request. Stateless: the UI checked `state`.
            $discord = Socialite::driver('discord')
                ->stateless()
                ->redirectUrl($request->input('redirect_uri'))
                ->user();
        } catch (ClientException $e) {
            // A used, expired or mismatched code: the visitor can just try again.
            throw ValidationException::withMessages(['code' => "Discord didn't accept the sign-in. Try again."]);
        }

        $user = $this->findOrCreateUser($discord);

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $tokens->make($user->getKey(), 'Discord')->accessToken,
        ]);
    }

    /**
     * The user with this Discord id, created on their first sign-in. Name, email and avatar follow
     * Discord on every sign-in.
     */
    private function findOrCreateUser(DiscordUser $discord): User
    {
        $user = User::firstOrNew(['discord_id' => $discord->getId()]);

        $user->fill([
            // Discord's display name; Socialite's getName() is the username.
            'name' => $discord->user['global_name'] ?? $discord->getName(),
            // An unverified email could belong to someone else.
            'email' => ($discord->user['verified'] ?? false) ? $discord->getEmail() : null,
            'avatar' => $discord->getAvatar(),
        ]);

        $user->save();

        return $user;
    }
}
