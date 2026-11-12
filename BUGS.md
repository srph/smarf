# Bugs

Known issues, flagged for later. Remove an entry when it's fixed.

## UI

- **Home: blank on error.** If `GET /boards` fails, the page renders nothing.
- **Board page: blank on error or 404.** A failed or missing board renders nothing. Wanted: a "Board not found" screen.
- **Hero drag sends extra requests.** One PUT per category crossed during a drag, plus a reverse PUT on cancel.
- **Temporary ids reach the API (likely).** Moving a hero or category before its add request returns sends the temporary uuid.
- **Board saves can arrive out of order.** Saves for one board run in parallel.
- **Toolbar hides failed saves.** It shows "Saved" after a failed save is rolled back.
- **`Board` type is wrong for the list.** `GET /boards` items have no `categories`, but the type says they do.
- **4xx errors are retried.** Queries retry 3 times by default, so error UI shows only after about 7 seconds, even for a 404.

## API

- **Categories come back unsorted.** `Board::categories()` has no `orderBy` and ids are uuids, so the order differs from creation order and can change between loads.
- **Hero order can collide (edge case).** `order` is a double. Dropping heroes into the same gap over and over halves it each time, until two heroes share a value and their sort order becomes arbitrary.
