# Smarf API

Laravel 9 JSON API for Smarf: users, boards, categories, and heroes. The UI (`../ui`) authenticates with Passport's password grant (`POST /api/oauth/token`) and sends a bearer token.

## Commands

```bash
valet php --site=smarf artisan serve --host=0.0.0.0 --port=13001   # or `make start:api` from the root
valet php --site=smarf artisan migrate
valet php --site=smarf artisan db:seed             # truncates users, creates one admin
valet php --site=smarf artisan smarf:admin         # create an admin interactively
valet php --site=smarf artisan smarf:hero --pretty # print OpenDota hero list for a migration
valet php --site=smarf artisan passport:client --password
valet php --site=smarf vendor/bin/phpunit
```

PHP 8.1 is pinned in `.valetrc`. Valet only reads it for a linked site, so pass `--site=smarf` (`make install:api` links `api/` as `smarf`). The database is the root `compose.yaml` (127.0.0.1:3308, root/root).

## Structure

```
app/Http/Controllers/   Auth, Boards, Categories, Heroes
app/Http/Middleware/    UserOwnsBoard (board.own), UserOwnsCategory (category.own)
app/Models/             User, Board, Category, Hero (Board/Category use the Uuid trait)
app/Console/Commands/   smarf:admin, smarf:hero
database/migrations/    schema; hero rows are inserted by migrations, not seeders
routes/api.php          all endpoints
```

## Best practices

- Put every board/category route behind `auth:api` and the matching ownership middleware.
- Change the hero list with a new migration (use `smarf:hero` to generate it). Don't edit old migrations.
- Validate in the controller with `$request->validate()` and return models or resources, not hand-built arrays.
- Write a feature test for any new or changed endpoint.
