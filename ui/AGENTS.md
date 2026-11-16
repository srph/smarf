# Smarf UI

React front-end for Smarf: the board list, and the board workspace where users drag heroes between resizable categories.

React 19, TypeScript 7 (strict), Vite 8, Tailwind CSS 4, React Router 8, TanStack Query 5, Base UI and dnd-kit. Node 26 is pinned in `.nvmrc`.

## Commands

```bash
npm start           # Vite dev server on port 13000 (or `make start:web` from the root)
npm run build       # production build to dist/
npm run typecheck   # tsc --noEmit (Vite doesn't type-check)
npm run lint        # Oxlint
npm run format      # Prettier
npm test            # Vitest (npm run test:watch to watch)
```

## Verification

Before committing, all of these pass:

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
├── queries/      query and mutation hooks shared by routes, a folder per domain
├── routes/       a folder per route; `.` marks nesting (app.boards.id = /b/:boardSlug)
├── types/        API and board types
├── config.ts     env vars (read them only here)
└── index.css     Tailwind theme, focus rings, stacking order
tests/            integration tests against a fake API (support/)
public/           copied as-is
```

## Naming

- Files and folders are kebab-case; exports are named after the file (`use-login.ts` → `useLogin`).
- No barrel files. Import the file that defines the thing.
- Keep components route-local until a second route needs them, then move them to `components/<name>/`.

## Data

- One hook per request. Shared hooks live in `src/queries/<domain>/`; a route's own go in its `queries/` and `mutations/` folders.
- Build query keys with the key factories (`boardKeys.list()`) and cache plain data: unwrap the response in `queryFn`, derive views with `select`.
- Destructure and rename (`const { data: boards, status: boardsStatus } = useBoardsQuery()`), then handle `pending`, `error` and success.

## Testing

- Tests render the whole `<App />` at a URL (`renderApp('/b/123')`) against an in-memory fake of the API (`tests/support/`). Seed with `seedBoard()`; assert on what the user sees and on `db`.
- When the API changes, update the fake handlers to match.
- Drags run with `installFakeLayout()` and user-event. Resizing isn't covered, and Vitest loads packages differently from the dev server, so check those in a browser.

## Optimistic updates

The cached board is the source of truth, and every board save changes it before the API answers.

- **Where:** board saves are in `routes/app.boards.id/mutations/`, plus `queries/boards/use-favorite-board-mutation.ts`. Their shared options come from `useBoardCache(boardSlug)` in `queries/boards/use-board-cache.ts`.
- **How:** each save spreads `optimisticSaveOptions` and writes its change with `update()` in `onMutate`, with no `await` before it. The shared options give every save the board's `mutationKey` (the toolbar's Saved / Couldn't save reads it) and its `scope`, so saves reach the API one at a time, in order. After a failed save, the board refetches once the queue is empty.
- **Drags and resizes** are drafts: `BoardProvider` (`routes/app.boards.id/board-context.tsx`) shows a changed copy of the board until `clearDraft()`. Nothing saves mid-drag. On drop, call the mutation once, then `clearDraft()`; on cancel, just `clearDraft()`.

## Styling

- Tailwind classes on the element, joined with `cn`. Write class names in full (pick from a map, never `bg-${color}`); runtime values go in `style`.
- `zinc` for neutrals and `primary-*` (indigo) for the brand and every accent: hover, focus, active, selection. Never sky.
- Focus: `focus-visible:ring-focus`, an indigo ring with a gap. Use `ring-focus-danger` on destructive buttons and `ring-focus-field` with `border-primary-400` on text fields. A surface that isn't the page colour sets the gap with `focus-gap-*` (`focus-gap-zinc-800`).
- Corner radius goes by height: `rounded-md` under 32px, `rounded-lg` for 32–40px controls, `rounded-xl` for 44px and up and every surface. Hero portraits are `rounded-sm`. No bare `rounded`.
- Stay on Tailwind's scales (spacing in 4px steps, no arbitrary values). Stack with the `--z-*` variables (`z-(--z-popover)`).
- Menus and popovers are Base UI, through `components/menu` and `components/popover` (solid) or `components/glass-menu` and `components/glass-popover` (frosted).
- Icons come from `@heroicons/react/20/solid`, through `<Icon icon={TrashIcon} />`.
