# Smarf UI

React front-end for Smarf: the board list, and the board workspace where users drag heroes between resizable categories.

React 17, TypeScript, Parcel 2, styled-components, React Router 6, react-query 3, and dnd-kit for drag and drop. Node 16 is pinned in `.nvmrc`.

## Commands

```bash
npm install
npm start       # Parcel dev server, http://localhost:1234 (or `make start:web` from the root)
npm run build   # production build to dist/ (+ netlify/_redirects)
```

`.env` holds `API_URL` and the Passport password client (`OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`). `make install` fills these in.

## Structure

```
src/
├── components/   shared UI primitives (Button, Input, Popover, ...)
├── contexts/     AuthUser (token cookie + axios auth), BoardList, HeroList, Query
├── hooks/        generic hooks (useDebouncedEffect, useOutsideClick, ...)
├── lib/axios.ts  configured axios instance
├── routes/       one folder per route; `.` marks nesting (app.boards.id = /boards/:id)
├── types/        API and board-operation types
├── config.ts     reads env vars
└── theme.ts      styled-components theme
```

## Best practices

- Fetch and mutate through react-query hooks next to the route that uses them (see `routes/app.boards.id/contexts`).
- Keep components route-local until a second route needs them, then move them to `components/`.
- Use theme values from `theme.ts` instead of hard-coded colors and spacing.
- Read env vars only in `config.ts`.
