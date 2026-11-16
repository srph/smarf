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

The UI runs on port 13000 and the API on 13001, on all interfaces. The `.env` files point at `http://mbp.boga-parore.ts.net:13000` and `http://mbp.boga-parore.ts.net:13001` (a Tailscale MagicDNS name); change `APP_URL` in `api/.env` and `VITE_API_URL` in `ui/.env` if your machine has another name.

Sign-in is Discord-only. Create an app at https://discord.com/developers/applications, add `http://mbp.boga-parore.ts.net:13000/login/discord` to its OAuth2 redirects, then put its client id and secret in `api/.env` (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`) and its client id in `ui/.env` (`VITE_DISCORD_CLIENT_ID`). Your account is created the first time you sign in.
