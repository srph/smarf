# Smarf

A Dota 2 hero organizer for the browser. It recreates the in-game hero grid: boards hold resizable, movable categories, and each category holds an ordered list of heroes.

- **API** (`api/`): Laravel 9 on PHP 8.1, with Passport password-grant auth and MySQL 8. See [api/AGENTS.md](api/AGENTS.md).
- **UI** (`ui/`): React 17 + TypeScript, bundled with Parcel 2. See [ui/AGENTS.md](ui/AGENTS.md).

## Tooling / Dependencies

- PHP 8.1 via Laravel Valet (`api/.valetrc`)
- Composer 2
- MySQL 8 via Docker (`compose.yaml`)
- Node 16 via nvm (`ui/.nvmrc`) and npm
- Docker with Compose v2
- Make

## Commands

```bash
make install      # install:api + install:web, start the DB, migrate, write the OAuth client to ui/.env
make install:api  # composer install, api/.env, app key, Passport keys
make install:web  # npm install, ui/.env
make start:db     # Docker MySQL 8 on 127.0.0.1:3308 (root/root, database smarf)
make start:api    # http://localhost:3001
make start:web    # http://localhost:1234
```

## Structure

```
api/          Laravel API
ui/           React front-end
compose.yaml  local MySQL (api/docker-compose.yml is the old Sail setup; not used)
Makefile      entry points above
```

## Best practices

- Run PHP through `valet php --site=smarf` / `valet composer --site=smarf` (pinned by `api/.valetrc`) and Node through nvm (`ui/.nvmrc`), not the system binaries.
- Keep API and UI changes in step: response shapes live in `ui/src/types/api.ts`.
- Never commit `.env` files or Passport keys.
