# Backlogs

Bigger pieces of work, scoped for later. Remove an entry when it ships. Smaller items live in the Backlog table in [BUGS.md](BUGS.md).

## Deadlock support

Boards for Valve's Deadlock alongside Dota 2.

Decided:

- A board is one game. It can't change after the board is created.
- Deadlock heroes aren't grouped: the hero picker shows one flat list, A to Z.
- We store the hero images ourselves; no hotlinking.

Unconfirmed: Deadlock's card size and the community API's field names. The API wasn't reachable when this was scoped.

### Schema (one migration)

- `heroes.game`: `enum('dota2','deadlock')`, default `dota2`.
- `heroes.attribute` becomes nullable, since Deadlock heroes have none.
- `boards.game`: same enum, default `dota2`.
- Existing rows become `dota2` through the default, so no data needs moving.
- Add `game` to `$fillable` on `Hero` and `Board`.

### API

- `GET heroes?game=deadlock`. With no game it returns `dota2`, so current callers keep working.
- `POST boards` takes `game` (required, one of the two).
- Only heroes from the board's game are allowed:
  - `CreateBoardRequest` (`categories.*.heroes.*.id`)
  - `InsertHeroRequest` (`hero_id`)
- `BoardsController::duplicate` already copies the board with `replicate()`, so the game carries over.
- Feature tests for the filter and both checks.

### Images

- `smarf:hero --game=deadlock` would:
  - Fetch the list from the community API (`assets.deadlock-api.com/v2/heroes`).
  - Keep only playable heroes (`player_selectable`, not `disabled` or `in_development`).
  - Download each hero card and resize it to one fixed size, as `.webp`.
  - Write a migration, as for Dota.
- Store the images in `ui/public/heroes/deadlock/<slug>.webp` (served with the UI), and save that path in `thumbnail`.
- Fixing the size once at import keeps the layout sizes below exact.
- The list changes as Valve adds and removes heroes: plan on a new migration every few patches.

### Query (UI)

- `useHeroesQuery(game, select?)`, keyed `['heroes', game]`, still `staleTime: Infinity`.
- `types/api.ts`:
  - `type Game = 'dota2' | 'deadlock'`
  - `Hero.game` and `Board.game`
  - `Hero.attribute` becomes `HeroAttribute | null`
- Callers:
  - Hero picker (`board-workspace-hero-selector.tsx`): reads the board's game. For Deadlock it shows the flat list, with no attribute headers.
  - New board (`boards-new-route.tsx`): needs a game choice before it loads heroes.
  - The navigation prefetch, home empty state and sign-in backdrop can stay on `dota2`.
- `tests/support` (`handlers.ts`, `db.ts`): filter by `game` and add a few Deadlock heroes.

### Per-game hero sizes

- The 80×45 (16:9) hero size is fixed in `contexts/board-list/constants.ts`. About 10 files read it.
- Replace those constants with `getHeroLayout(game)`, which returns width, height and aspect ratio. `BoardProvider` passes it down.
- The layout math (`getCategoryHeight`, the column count, the starting category size) uses those values. The calculations themselves stay the same.
- Deadlock's cards are portrait. Pick the size once we see the real cards (likely about 60×80).
- Category sizes are saved in pixels. A board has one game, so saved boards don't need migrating.

### Later

- A game badge in the board list and switcher.
- Page copy that says "Dota 2 hero organizer" (`index.html`, `config.ts`, `auth-route.tsx`).
- Deadlock starter boards in onboarding. The current starters look heroes up by Dota name.

### Order

Schema and API, then the import and images, then the query, then the hero sizes.
