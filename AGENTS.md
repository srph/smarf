# Smarf

A Dota 2 hero organizer for the browser. It recreates the in-game hero grid: boards hold resizable, movable categories, and each category holds an ordered list of heroes.

- **API** (`api/`): Laravel 9 on PHP 8.1, with Discord-only sign-in (Socialite, issuing Sanctum tokens) and MySQL 8. See [api/AGENTS.md](api/AGENTS.md).
- **UI** (`ui/`): React 19 + TypeScript 7, built with Vite 8 and tested with Vitest. See [ui/AGENTS.md](ui/AGENTS.md).

## Tooling / Dependencies

- PHP 8.1 via Laravel Valet (`api/.valetrc`)
- Composer 2
- MySQL 8 via Docker (`compose.yaml`)
- Node 26 via nvm (`ui/.nvmrc`) and npm
- Docker with Compose v2
- Make

## Commands

```bash
make install      # install:api + install:web, start the DB, migrate
make install:api  # composer install, api/.env, app key
make install:web  # npm install, ui/.env
make start:db     # Docker MySQL 8 on 127.0.0.1:3308 (root/root, database smarf)
make start:api    # http://mbp.boga-parore.ts.net:13001 (all interfaces; Tailscale MagicDNS)
make start:web    # http://mbp.boga-parore.ts.net:13000 (all interfaces)
```

## Structure

```
api/          Laravel API
ui/           React front-end
showcase/     a one-minute film of the app: a hand-drawn copy of the UI on one seekable GSAP timeline (not built from ui/)
compose.yaml  local MySQL (api/docker-compose.yml is the old Sail setup; not used)
Makefile      entry points above
```

## Best practices

- Run PHP through `valet php --site=smarf` / `valet composer --site=smarf` (pinned by `api/.valetrc`) and Node through nvm (`ui/.nvmrc`), not the system binaries.
- Keep API and UI changes in step: response shapes live in `ui/src/types/api.ts`.
- Never commit `.env` files.
- The showcase film copies the app's look by hand. After a visible UI change, update `showcase/` to match, check it with `node showcase/render.mjs --stills 7.5,13,29` and re-render the video with `node showcase/render.mjs` (needs Chrome and ffmpeg; writes `showcase/smarf-showcase.mp4`, which isn't committed). To watch it in a browser, serve `showcase/` on `localhost`: the font kit doesn't serve other hosts.
