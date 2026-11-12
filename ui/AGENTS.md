# Smarf UI

React front-end for Smarf: the board list, and the board workspace where users drag heroes between resizable categories.

React 19, TypeScript 7, Vite 8, styled-components 6, React Router 8 (data router, `createBrowserRouter`), TanStack Query 5, Base UI for popovers and menus, and dnd-kit for drag and drop. Node 26 is pinned in `.nvmrc`. The 2026 dependency upgrade is recorded in [UPGRADE.md](UPGRADE.md).

## Commands

```bash
npm install
npm start           # Vite dev server, http://mbp:13000 (or `make start:web` from the root)
npm run build       # production build to dist/
npm run typecheck   # tsc --noEmit (Vite doesn't type-check)
npm test            # Vitest integration tests (npm run test:watch to watch)
```

`.env` holds `API_URL` and the Passport password client (`OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`). `make install` fills these in. Vite exposes them via `envPrefix` in `vite.config.ts`, so the names stay the same as on Netlify.

## Structure

```
index.html        Vite entry
public/           copied as-is: favicons, _redirects (Netlify)
src/
├── App.tsx       route table + providers; index.tsx only mounts it
├── assets/       images imported by components
├── components/   shared UI primitives (Button, Input, Popover, PageTitle, ...)
├── contexts/     AuthUser (current user, login/logout), BoardList, HeroList, Query
├── hooks/        generic hooks (useDebouncedEffect, useDelayedState, ...)
├── lib/         http.ts (fetch wrapper for the API), token.ts (auth token cookie)
├── routes/       one folder per route; `.` marks nesting (app.boards.id = /b/:boardId)
├── types/        API and board-operation types
├── config.ts     reads env vars
└── theme.ts      styled-components theme
tests/
├── *.test.tsx    integration tests: render the whole App at a URL against a fake API
└── support/      MSW handlers + in-memory db, render helper, fake layout for drag-and-drop
```

## Testing

- Tests render `<App />` at a URL (`renderApp('/b/123')`) and talk to an in-memory fake of the Laravel API (`tests/support/handlers.ts`, `db.ts`). Seed data with `seedBoard()`; assert on what the user sees and on `db`.
- When the API changes, update the fake handlers to match.
- Drag and drop runs with `installFakeLayout()` (jsdom has no layout): heroes through dnd-kit's keyboard controls, categories through `user.pointer`. Resizing isn't covered; check it in a browser.
- Drive drags with user-event so React renders between steps. dnd-kit applies moves after React renders, so a drag that finishes before any render (raw events in one `act`, or a browser tool's instant drag) drops without moving. Real drags are fine.
- Vitest loads packages with Node's rules, not the way the Vite dev server does. A CommonJS import that works in tests can still break in `npm start`, so do a quick browser check after dependency changes.

## Best practices

- Fetch and mutate through the TanStack Query hooks in `contexts/Query` next to the route that uses them.
- Board operations (`routes/app.boards.id/contexts`) treat the query cache as the source of truth: read with `getBoard()`, write with `setBoard()` before the request, call `rollback` on error, and pass `mutationKey: boardKey`. Drag and resize go through `setDraft` until they finish.
- Build popovers and menus on Base UI (`@base-ui/react`); `components/Popover` covers the usual popover. Style its parts with styled-components and its `data-*` state attributes (`data-popup-open`, `data-highlighted`).
- Keep components route-local until a second route needs them, then move them to `components/`.
- Import icons from `@heroicons/react/20/solid` and pass the component: `<Icon icon={TrashIcon} />`.
- Prefix styled-components props that only feed styles with `$` (`$width`, `$color`) so they don't reach the DOM.
- Use theme values from `theme.ts` instead of hard-coded colors and spacing.
- Read env vars only in `config.ts`.
- Export types with `export { type Foo }`. Vite compiles each file on its own, so a bare type re-export breaks the build.
