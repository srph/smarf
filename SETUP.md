# Setup

## Requirements

- PHP 8.1 and Composer 2 (via [Laravel Valet](https://laravel.com/docs/valet), pinned by `api/.valetrc`)
- Node 26 (via nvm, pinned by `ui/.nvmrc`)
- Docker with Compose v2 (for MySQL 8)
- Make

## Getting started

Install everything, start the database, and run migrations:

```bash
make install
```

Then start the API and the UI in separate terminals:

```bash
make start:api
```

```bash
make start:web
```

- The UI runs on port 13000 and the API on 13001, on all interfaces.
- The `.env` files use `mbp.boga-parore.ts.net`, a Tailscale MagicDNS name.
- On another machine, change `APP_URL` in `api/.env` and `VITE_API_URL` in `ui/.env`.

## Discord sign-in

Sign-in is Discord-only.

1. Create an app at https://discord.com/developers/applications.
2. Add `http://mbp.boga-parore.ts.net:13000/login/discord` to its OAuth2 redirects.
3. In `api/.env`, set `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`.
4. In `ui/.env`, set `VITE_DISCORD_CLIENT_ID` (the same client id).

Your account is created the first time you sign in.
