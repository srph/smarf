# Smarf

A Dota 2 hero organizer for the browser, recreating the in-game hero grid.

Boards hold resizable categories; categories hold ordered heroes.

- **API** (`api/`): Laravel 9, PHP 8.1, MySQL 8, Discord sign-in. See [api/AGENTS.md](api/AGENTS.md).
- **UI** (`ui/`): React 19, TypeScript 7, Vite 8, Vitest. See [ui/AGENTS.md](ui/AGENTS.md).

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
showcase/     a one-minute film of the app, drawn by hand (not built from ui/)
compose.yaml  local MySQL (api/docker-compose.yml is unused)
Makefile      entry points above
```

## Best practices

- Run PHP via `valet php --site=smarf` and `valet composer --site=smarf`.
- Run Node via nvm (`ui/.nvmrc`), not the system binary.
- Keep API and UI in step: response shapes live in `ui/src/types/api.ts`.
- Never commit `.env` files.

## Showcase

- Update it only when asked; it doesn't follow UI changes.
- Check stills: `node showcase/render.mjs --stills 7.5,13,29`.
- Render: `node showcase/render.mjs` (needs Chrome and ffmpeg; the output isn't committed).
- Then refresh the login page's committed 720p copy, `ui/public/showcase.mp4` (about 5 MB):

```bash
ffmpeg -y -i showcase/smarf-showcase.mp4 -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart ui/public/showcase.mp4
```

- To watch it, serve `showcase/` on `localhost`; the font kit rejects other hosts.
