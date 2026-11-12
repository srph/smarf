# UI upgrade plan

Moving `ui/` from Node 16 / React 17 / Parcel to a current stack. Work happens on the `v1.5` branch, one commit (or a few) per phase. Tick items as they land.

## Target stack

Versions checked against npm on 2026-11-11.

| Area | From | To |
|---|---|---|
| Node | 16 | 26 LTS |
| Bundler | Parcel 2.5 | Vite 8 |
| React | 17 | 19.3 |
| Router | React Router 6 | React Router 8, data mode (`createBrowserRouter`) |
| Data | react-query 3 + axios | TanStack Query 5 + `fetch` |
| UI primitives | react-popper, hand-rolled popovers | Base UI (`@base-ui/react`) |
| Icons | heroicons 1 | heroicons 2 |
| Styling | styled-components 5 | styled-components 6 (keeping it for now) |
| Drag and drop | dnd-kit core 5 / sortable 6 | dnd-kit core 6 / sortable 10 |
| TypeScript | 4.x (via Parcel) | 6.x first; try 7 (the native compiler) in phase 6 |
| Tests | none | Vitest + Testing Library + MSW |

## Decisions

- Keep styled-components for now. Migrate to v6 and use `$transient` props.
- React Router in data mode, not framework mode. TanStack Query owns data, so we don't need loaders. This keeps the most existing code.
- The query cache is the source of truth. No copying query data into `useState` via `onSuccess`.
- While dragging or resizing, the in-progress position or width lives in component state. It's saved to the cache and the API on drop.
- Remove `swr` and `use-swr` (unused). `cookie` goes with `use-cookie-state` in phase 4.
- Env var names stay the same (`API_URL`, `OAUTH_CLIENT_*`) via Vite's `envPrefix`, so Netlify settings don't change.

## How each phase is verified

- `npm run build`, `npm run typecheck` and `npm test` pass.
- Browser check on the Mac (Chrome) against the local API (`make start:db`, `make start:api`, `make start:web`):
  - [ ] Register, log out, log in
  - [ ] Create a board and rename it
  - [ ] Favorite, duplicate and delete a board
  - [ ] Add and rename a category; delete a category
  - [ ] Add a hero through the hero selector
  - [ ] Drag a hero within a category and to another category
  - [ ] Drag a category; resize a category
  - [ ] Reload the page: changes persisted
  - [ ] Popovers and the user dropdown open and close (including clicking outside)
  - [ ] No console errors or warnings

## Phases

### 1. Tooling and baseline tests (still on React 17)

- [x] `.nvmrc` → 26; the Makefile's `use_nvm` picks it up
- [x] Replace Parcel with Vite 8 + `@vitejs/plugin-react`
  - [x] `index.html` at the `ui/` root; `~` alias in `vite.config.ts`
  - [x] Env: `process.env.X` → `import.meta.env.X` (only in `config.ts`). The names stay the same via `envPrefix`, so `.env`, the Makefile and Netlify don't change
  - [x] `netlify/_redirects` → `public/_redirects`; favicons → `public/favicon`; images → `src/assets/images`
  - [x] Dev server binds `127.0.0.1:1234` (Node resolves `localhost` to `::1`, which browsers didn't reach)
  - [x] Remove `parcel`, `@parcel/*`, `buffer`, `process`
- [x] `tsconfig`: `moduleResolution: bundler`, `jsx: react-jsx`, ES2022 target; `typecheck` script
  - [x] `strict: false` set explicitly (TypeScript 6 turns it on by default; the code never used it)
  - [x] Type re-exports use `export { type X }`; fixed the existing type errors Parcel never checked
- [x] Remove `swr`, `use-swr`. **`cookie` stays**: `use-cookie-state` needs it. It goes in phase 4
- [x] Vitest + jsdom + Testing Library (v12, for React 17) + MSW 3
  - [x] Fake API: MSW handlers over an in-memory db (`tests/support`)
  - [x] Auth (8): logged-out redirect, login, wrong password, register, guest-only pages, rejected token, 401 → logout, /logout
  - [x] Board list (4): favorite/recent sections, favorite from list, create board → opens it, open a board
  - [x] Workspace (9): render, rename/favorite/duplicate/delete board, add/rename/delete category, add hero
  - [x] Drag and drop (2): reorder within a category, move to another category (keyboard + fake layout)
- [x] `App` split out of `index.tsx`; one query client per `QueryProvider` (needed so tests don't share a cache)
- [x] Update `ui/AGENTS.md`, root `AGENTS.md`, `readme.md` (Node, Vite, commands)
- [x] Browser check (Chrome on the Mac, dev server and production preview). Everything on the checklist works. One console warning: React 17's "state update on an unmounted component" after deleting a category. It's harmless, and React 18+ no longer warns about it.
  - Found and fixed: the board page crashed in the dev server because `react-input-autosize` (CommonJS) came through as the whole module. Vitest and the production build were fine, so the tests didn't catch it

### 2. React 19 and React Router 8

- [x] `react`/`react-dom` 19.3, `@types/react` 19, Testing Library 16, `@types/styled-components` 5.1.36, `re-resizable` 6.11 (supports 19)
- [x] `ReactDOM.render` → `createRoot`
- [x] Wrap the app in `StrictMode` (inside `App`, so tests run under it too)
- [x] `React.FC` components that take children: add `PropsWithChildren`; `useRef()` calls get an initial value
- [x] React Router 8 with `createBrowserRouter`; package is `react-router` only (`react-router-dom` removed). Providers that use router hooks render in a root layout route. Unknown URLs now redirect to `/` (before, they rendered a blank page)
- [x] Replace `react-helmet-async` with React 19's built-in `<title>` via `components/PageTitle`. Pages without one fall back to the `index.html` title (Helmet used to leave the previous page's title)
- [x] Libraries that cap React below 19 get a temporary `overrides` entry in `package.json` (no global `legacy-peer-deps`): `react-query` (removed in phase 3), `react-helmet-async` (this phase), `react-input-autosize`, `use-cookie-state`, `react-popper` (phase 4)
- [x] Fix whatever StrictMode's double effects expose: nothing broke (tests, popovers, menus, logout all fine)
- [x] Browser check (Chrome on the Mac, dev server and production preview): everything on the checklist works, no console errors
  - Drags must be paced like real ones. The browser tool's instant drag does nothing on React 18+, because dnd-kit applies moves after React renders. A drag spread over a few frames works, and so do real ones
  - Found and fixed a test-helper bug (`installFakeLayout` never cleaned up, so later drag tests broke)
  - The JS bundle grew from 681 kB to 839 kB (React 19 + React Router 8). Worth code-splitting later

### 3. Data layer: fetch + TanStack Query 5

- [x] `lib/http.ts`: a `fetch` wrapper that adds the bearer token, parses JSON, throws `HttpError` on non-2xx, and reports 401s (except `/oauth/token`) to `onUnauthorized` listeners
- [x] Remove axios and `useInterceptor`
- [x] `lib/token.ts`: the token cookie (same name and options, so existing logins carry over) with `useToken()`. Pulled forward from phase 4 because the fetch wrapper needs the token outside React; `use-cookie-state` removed, `cookie` bumped to 1.x
- [x] `@tanstack/react-query` 5; rewrite the `contexts/Query` wrappers (object-form options, array keys, `isPending` for mutations). Queries pass TanStack's abort signal to `fetch`, so a query with no observers left cancels its request. A late 401 from a finished test was logging out the next one
- [x] Auth: user comes from the `['auth/me']` query; `useAuthUser` (user, token) plus `useLogin` / `useRegister` / `useLogout` hooks. If `auth/me` fails for any reason other than a 401, there's an error with Try again / Log out instead of a blank screen
- [x] Login navigates within the app instead of reloading the page, back to the page that asked for login
- [x] Board workspace: the board comes from the query cache. Operations read it with `getBoard()` when they run and write it with `setBoard()` before the request, so changes show immediately. A failed save drops any draft and refetches the board (simpler and safer than restoring snapshots)
- [x] Drag and resize: in-progress values are a `CategoryDraft` layered over the cached board; saved to the cache and the API on drop or resize end
- [x] Remove `useStateRef` / `boardRef` from board operations (the `DivdedQueryAndMutationProps` type is now `BoardOperationProps`)
- [ ] Fix `useDelayedState` (it never sets `timeoutRef`)
- [ ] Fix `useGridCollisionDetection` `onDragStart`: it calls `indexOf` on the container id string instead of on its hero list, so cancelling a cross-category drag puts the hero back in the wrong place
- [ ] Browser check

### 4. Base UI and leftover libraries

- [ ] `@base-ui/react`: Popover (`Popover`, `DeletePopover`, `EditPopover`, `HeroSelector`), Menu (`UserDropdown`)
- [ ] Remove `react-popper`, `@popperjs/core`, `PopoverPortal`, `useOutsideClick` (if nothing else uses it)
- [ ] `CategoryTitle`: `field-sizing: content`, with `size={value.length}` as a fallback; remove `react-input-autosize`
- [x] Token cookie: small hook instead of `use-cookie-state` (done in phase 3, `lib/token.ts`)
- [ ] Remove the remaining React `overrides` from `package.json`
- [ ] Browser check

### 5. Icons, styling, dnd-kit, and the rest

- [ ] heroicons 2: import icons directly instead of looking them up by string name; rename the icons v2 renamed (`search`, `x`, `duplicate`, `lightning-bolt`, `arrows-expand`, `adjustments`, `template`)
- [ ] styled-components 6: switch custom props to `$prop`; no unknown-prop warnings
- [ ] dnd-kit core 6 / sortable 10 / modifiers / utilities; keep the custom collision detection for moving heroes between categories
- [ ] Bump `re-resizable`, `immer`, `date-fns`, `uuid`; trim `lodash` where it's only used once or twice
- [ ] Browser check

### 6. Wrap-up

- [ ] Try TypeScript 7; keep 6.x if any tool doesn't support it yet
- [ ] Update `readme.md`
- [ ] Every item in this file ticked or moved to "Later"

## Open questions

- Netlify: env var names are unchanged and Node comes from `.nvmrc` (now 26). Check that the site's build command is `npm run build` with publish directory `dist`, since `_redirects` is now copied from `public/`.

## Later (not part of this upgrade)

- Code-split the bundle (839 kB, about 239 kB gzipped), e.g. lazy-load the board workspace.
- API: duplicating a board collapses a hero that appears twice in one category (`BoardsController::duplicate` keys pivots by hero id). The UI also allows adding the same hero twice; decide which is intended.
- `@dnd-kit/react` (0.5, pre-1.0) could replace the custom multi-container collision code.
- Replace styled-components (it's in maintenance mode).
- The OAuth client secret ships in the browser bundle because the password grant runs in the browser. Consider doing the token exchange on the API side.

## Log

- 2026-11-11: Plan written.
- 2026-11-12: Phase 1 done. 23 tests pass, plus typecheck and build. Browser check passed after fixing the autosize import.
- 2026-11-12: Phase 2 done: React 19.3, React Router 8, `<title>` instead of Helmet, StrictMode. 26 tests pass, plus typecheck and build; browser check passed.
