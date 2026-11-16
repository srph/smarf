# Smarf UI

Smarf's front-end: the board list, and the board workspace for dragging heroes.

- React 19, TypeScript 7, Vite 8, Tailwind CSS 4
- React Router 8, TanStack Query 5
- Base UI for menus, dnd-kit for drag and drop
- Node 26, pinned in `.nvmrc`

## Commands

```bash
npm start           # dev server on port 13000 (or `make start:web` from the root)
npm run build       # production build to dist/
npm run typecheck   # tsc (Vite doesn't type-check)
npm run lint        # Oxlint
npm run format      # Prettier
npm test            # Vitest (test:watch to watch)
```

## Verification

Before committing, these all pass:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

## Structure

```
src/
├── app.tsx       route table and providers
├── components/   shared UI primitives, a folder each
├── contexts/     current user, board layout constants, query provider
├── hooks/        generic hooks
├── lib/          fetch wrapper, auth token, small helpers
├── queries/      hooks shared by routes, a folder per domain
├── routes/       a folder per route; `.` marks nesting (app.boards.id = /b/:boardSlug)
├── types/        API and board types
├── config.ts     env vars (read them only here)
└── index.css     Tailwind theme, focus rings, stacking order
tests/            integration tests against a fake API (support/)
public/           copied as-is
```

## Naming

- Files and folders are kebab-case.
- Exports are named after the file: `use-login.ts` → `useLogin`.
- Prefer named exports; avoid default exports.
- List exports at the end of the file: `export { Foo }`.
- Export types as `export { type Foo }`; a bare re-export breaks Vite's build.
- No barrel files: import the file that defines the thing.
- Keep components route-local until a second route needs one.

## Data

- One hook per request.
- Shared hooks go in `src/queries/<domain>/`.
- A route's own go in its `queries/` and `mutations/` folders.
- Build query keys with the key factories (`boardKeys.list()`).
- Cache plain data: unwrap responses in `queryFn`, derive views with `select`.
- Destructure and rename: `const { data: boards } = useBoardsQuery()`.
- Handle `pending`, `error` and success.

## Testing

- Tests render `<App />` at a URL against an in-memory fake API (`tests/support/`).
- Seed with `seedBoard()`; assert on what the user sees and on `db`.
- When the API changes, update the fake handlers.
- Drags run with `installFakeLayout()` and user-event.
- Check resizing and dependency changes in a browser; tests miss them.

## Optimistic updates

Every board save changes the cached board before the API answers.

- **Where:**
  - Saves: `routes/app.boards.id/mutations/`, plus `use-favorite-board-mutation.ts`.
  - Shared options: `useBoardCache(boardSlug)` in `queries/boards/use-board-cache.ts`.
- **How:**
  - Each save spreads `optimisticSaveOptions`.
  - `onMutate` writes the change with `update()`, with no `await` before it.
  - `scope` sends one board's saves one at a time, in order.
  - `mutationKey` feeds the toolbar's Saved / Couldn't save.
  - A failed save refetches the board once the queue empties.
- **Drags and resizes:**
  - `BoardProvider` (`board-context.tsx`) shows a draft copy until `clearDraft()`.
  - Nothing saves mid-drag.
  - Drop: call the mutation once, then `clearDraft()`. Cancel: just `clearDraft()`.

## Styling

- Tailwind classes on the element, joined with `cn`.
- Write class names in full: pick from a map, never `bg-${color}`.
- Runtime values go in `style`.
- `zinc` for neutrals; `primary-*` (indigo) for every accent. Never sky.
- Focus:
  - Default: `focus-visible:ring-focus`, an indigo ring with a gap.
  - Destructive buttons: `ring-focus-danger`.
  - Text fields: `ring-focus-field` with `border-primary-400`.
  - Off the page colour, set the gap with `focus-gap-*`.
- Corner radius by height:
  - `rounded-sm`: hero portraits
  - `rounded-md`: under 32px
  - `rounded-lg`: 32–40px controls
  - `rounded-xl`: 44px and up, and every surface
  - Never bare `rounded`.
- Tailwind scales only: 4px spacing steps, no arbitrary values.
- Stack with the `--z-*` variables: `z-(--z-popover)`.
- Menus and popovers: Base UI, via `components/menu`, `popover`, `glass-menu`, `glass-popover`.
- Icons: `@heroicons/react/20/solid`, via `<Icon icon={TrashIcon} />`.
