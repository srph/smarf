# Smarf API

Laravel 9 JSON API for Smarf: users, boards, categories, and heroes. Sign-in is Discord-only: the UI sends the code Discord gives it to `POST /api/auth/discord`, which trades it through Socialite (stateless) for the Discord profile, finds or creates the user by `discord_id`, and returns a Passport personal access token (30 days). The UI sends it as a bearer token.

## Commands

```bash
valet php --site=smarf artisan serve --host=0.0.0.0 --port=13001   # or `make start:api` from the root
valet php --site=smarf artisan migrate
valet php --site=smarf artisan smarf:hero --pretty # print OpenDota hero list for a migration
valet php --site=smarf artisan passport:client --personal  # needed to issue tokens
valet php --site=smarf vendor/bin/phpunit
```

PHP 8.1 is pinned in `.valetrc`. Valet only reads it for a linked site, so pass `--site=smarf` (`make install:api` links `api/` as `smarf`). The database is the root `compose.yaml` (127.0.0.1:3308, root/root).

Discord sign-in needs `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` in `.env`, from an app at https://discord.com/developers/applications whose OAuth2 redirects list the UI's `/login/discord` (`http://mbp.boga-parore.ts.net:13000/login/discord` locally).

## Structure

```
app/Http/Controllers/   Auth (me), DiscordAuth, Boards, Categories, Heroes
app/Http/Middleware/    UserOwnsBoard (board.own), UserOwnsCategory (category.own)
app/Models/             User, Board, Category, Hero (Board/Category use the Uuid trait)
app/Console/Commands/   smarf:hero
database/migrations/    schema; hero rows are inserted by migrations, not seeders
routes/api.php          all endpoints
```

## Best practices

- Put every board/category route behind `auth:api` and the matching ownership middleware.
- Change the hero list with a new migration (use `smarf:hero` to generate it). Don't edit old migrations.
- Validate in the controller with `$request->validate()` and return models or resources, not hand-built arrays.
- Write a feature test for any new or changed endpoint.
