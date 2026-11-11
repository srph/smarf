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
- Remove `swr`, `use-swr` and `cookie` (unused).

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

- [ ] `.nvmrc` → 26; check the Makefile's `use_nvm` still works
- [ ] Replace Parcel with Vite 8 + `@vitejs/plugin-react`
  - [ ] `index.html` at the `ui/` root; `~` alias in `vite.config.ts`
  - [ ] Env: `process.env.X` → `import.meta.env.VITE_X` (only in `config.ts`); update `.env.example` and the Makefile `oauth-client` target
  - [ ] `netlify/_redirects` → `public/_redirects`
  - [ ] Static assets (favicon, images, webmanifest) load
  - [ ] Remove `parcel`, `@parcel/*`, `buffer`, `process`
- [ ] `tsconfig`: `moduleResolution: bundler`, `jsx: react-jsx`, modern target; add a `typecheck` script
- [ ] Remove `swr`, `use-swr`, `cookie`
- [ ] Vitest + jsdom + Testing Library (v12, for React 17) + MSW
  - [ ] MSW handlers for auth, boards, categories, heroes
  - [ ] Tests: login success/failure, logged-out redirect, 401 → logout
  - [ ] Tests: board list, create board → navigates to it, favorite, duplicate, delete
  - [ ] Tests: workspace renders categories/heroes, rename board, add/rename/delete category, add hero
  - [ ] Tests: move a hero within and across categories using dnd-kit's keyboard sensor
- [ ] Update `ui/AGENTS.md` and the root `AGENTS.md` (Node, Vite, commands)
- [ ] Browser check

### 2. React 19 and React Router 8

- [ ] `react`/`react-dom` 19.3, `@types/react` 19, Testing Library 16
- [ ] `ReactDOM.render` → `createRoot`; wrap the app in `StrictMode`
- [ ] `React.FC` components that take children: add `PropsWithChildren`
- [ ] React Router 8 with `createBrowserRouter`; package is `react-router` only (drop `react-router-dom`)
- [ ] Replace `react-helmet-async` with React 19's built-in `<title>` (the title template moves into a small helper)
- [ ] Libraries that haven't been replaced yet may need `legacy-peer-deps` for now; note which ones and remove it in phase 4
- [ ] Fix whatever StrictMode's double effects expose
- [ ] Browser check

### 3. Data layer: fetch + TanStack Query 5

- [ ] `lib/http.ts`: a `fetch` wrapper that adds the bearer token, parses JSON, throws on non-2xx, and logs out on 401 (except `/oauth/token`)
- [ ] Remove axios and `useInterceptor`
- [ ] `@tanstack/react-query` 5; rewrite the `contexts/Query` wrappers (object-form options, array keys, `isPending`)
- [ ] Auth: user comes from the `['auth/me']` query; `useAuthUser` / `useLogin` / `useLogout` hooks; no blank screen when `auth/me` fails
- [ ] Login navigates within the app instead of reloading the page
- [ ] Board workspace: read the board from the query; mutations update the cache optimistically in `onMutate` and roll back in `onError`
- [ ] Drag and resize: keep in-progress values in local state; save on drop or resize end
- [ ] Remove `useStateRef` / `boardRef` from board operations
- [ ] Fix `useDelayedState` (it never sets `timeoutRef`)
- [ ] Browser check

### 4. Base UI and leftover libraries

- [ ] `@base-ui/react`: Popover (`Popover`, `DeletePopover`, `EditPopover`, `HeroSelector`), Menu (`UserDropdown`)
- [ ] Remove `react-popper`, `@popperjs/core`, `PopoverPortal`, `useOutsideClick` (if nothing else uses it)
- [ ] `CategoryTitle`: `field-sizing: content`, with `size={value.length}` as a fallback; remove `react-input-autosize`
- [ ] Token cookie: small hook instead of `use-cookie-state`
- [ ] Remove `legacy-peer-deps`
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

- Netlify: the env var names change (`VITE_` prefix) and the Node version comes from `.nvmrc`. Someone needs to update the Netlify site settings before the next deploy.

## Later (not part of this upgrade)

- `@dnd-kit/react` (0.5, pre-1.0) could replace the custom multi-container collision code.
- Replace styled-components (it's in maintenance mode).
- The OAuth client secret ships in the browser bundle because the password grant runs in the browser. Consider doing the token exchange on the API side.

## Log

- 2026-11-11: Plan written.
