import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { API, server } from './support/handlers'
import { db, heroNamesIn, seedBoard, type DbBoard } from './support/db'
import { currentPath, renderApp, screen } from './support/render'
import { type CategoryColor } from '~/src/types/api'
import { findCategory, heroesShownIn } from './support/workspace'

let board: DbBoard

beforeEach(() => {
  board = seedBoard('Ranked', [
    { name: 'Carries', heroes: ['Anti-Mage', 'Juggernaut'] },
    { name: 'Supports', heroes: ['Crystal Maiden'] }
  ])
})

const findBoard = () => db.boards.find((b) => b.id === board.id)

/** A seeded category's saved colour. */
const colorOf = (name: string) => db.categories.find((c) => c.name === name)?.color

const setColor = (name: string, color: CategoryColor) => {
  const category = db.categories.find((c) => c.name === name)
  if (category) category.color = color
}

describe('board workspace', () => {
  it('shows the board, its categories, and their heroes', async () => {
    renderApp(`/b/${board.id}`)

    const carries = await findCategory('Carries')
    expect(heroesShownIn(carries)).toEqual(['Anti-Mage', 'Juggernaut'])
    expect(heroesShownIn(await findCategory('Supports'))).toEqual(['Crystal Maiden'])
    expect(await screen.findByRole('button', { name: 'Switch board (current: Ranked)' })).toBeInTheDocument()
  })

  it('switches boards from the toolbar, listing each with its hero count', async () => {
    const turbo = seedBoard('Turbo', [{ name: 'Mid', heroes: ['Juggernaut'] }])
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Switch board (current: Ranked)' }))
    const ranked = await screen.findByRole('button', { name: /^Ranked/ })
    expect(ranked).toHaveAttribute('aria-current', 'true')
    expect(within(ranked).getByText('3 heroes')).toBeInTheDocument()

    const turboRow = screen.getByRole('button', { name: /^Turbo/ })
    expect(within(turboRow).getByText('1 hero')).toBeInTheDocument()
    await user.click(turboRow)

    await waitFor(() => expect(currentPath()).toBe(`/b/${turbo.id}`))
    expect(await findCategory('Mid')).toBeInTheDocument()
  })

  it('starts a new board from the button beside the switcher search', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Switch board (current: Ranked)' }))
    await screen.findByRole('textbox', { name: 'Find a board' })
    // Tab from the search field lands on it.
    await user.tab()
    expect(screen.getByRole('button', { name: 'New board' })).toHaveFocus()
    await user.keyboard('{Enter}')

    await waitFor(() => expect(currentPath()).toBe('/b/new'))
    expect(db.boards).toHaveLength(1)
  })

  it('renames the board', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Rename board' }))
    const input = await screen.findByRole('textbox', { name: 'Board name' })
    await waitFor(() => expect(input).toHaveFocus())
    await user.clear(input)
    await user.type(input, 'Ranked Solo{Enter}')

    await waitFor(() => expect(findBoard()!.name).toBe('Ranked Solo'))
    expect(await screen.findByRole('button', { name: 'Switch board (current: Ranked Solo)' })).toBeInTheDocument()
  })

  it('disables New category while the board is being renamed', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Rename board' }))
    const newCategory = screen.getByRole('button', { name: 'New category' })
    expect(newCategory).toHaveAttribute('aria-disabled', 'true')

    await user.click(newCategory)
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(db.categories.map((c) => c.name)).not.toContain('Untitled')

    await user.keyboard('[Escape]')
    await waitFor(() => expect(newCategory).not.toHaveAttribute('aria-disabled'))
  })

  it('favorites the board from the toolbar', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Favorite board' }))

    expect(await screen.findByRole('button', { name: 'Unfavorite board' })).toBeInTheDocument()
    await waitFor(() => expect(findBoard()!.is_favorite).toBe(true))
  })

  it('toggles the favorite again while the first save is still pending', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      http.put(`${API}/boards/:id/favorite`, async () => {
        await answered
        return undefined
      })
    )
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Favorite board' }))
    await user.click(screen.getByRole('button', { name: 'Unfavorite board' }))
    expect(screen.getByRole('button', { name: 'Favorite board' })).toBeEnabled()

    release()

    await waitFor(() => expect(findBoard()!.is_favorite).toBe(false))
    expect(screen.getByRole('button', { name: 'Favorite board' })).toBeInTheDocument()
  })

  it('duplicates the board and opens the copy', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'More board actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Duplicate board' }))

    await waitFor(() => expect(db.boards).toHaveLength(2))
    const copy = db.boards[1]
    await waitFor(() => expect(currentPath()).toBe(`/b/${copy.id}`))
    expect(heroesShownIn(await findCategory('Carries'))).toEqual(['Anti-Mage', 'Juggernaut'])
  })

  it('deletes the board once Hold to delete is held', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'More board actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete board…' }))
    expect(await screen.findByRole('heading', { name: `Delete ${board.name}` })).toBeInTheDocument()
    expect(screen.getByText('This will permanently delete this board. Are you sure?')).toBeInTheDocument()

    // Letting go early backs out.
    const hold = screen.getByRole('button', { name: 'Hold to delete' })
    hold.focus()
    await user.keyboard('{Enter>}')
    await new Promise((resolve) => setTimeout(resolve, 300))
    await user.keyboard('{/Enter}')
    await new Promise((resolve) => setTimeout(resolve, 1200))
    expect(db.boards).toHaveLength(1)

    await user.keyboard('{Enter>}')
    await waitFor(() => expect(currentPath()).toBe('/'), { timeout: 3000 })
    expect(db.boards).toHaveLength(0)
  })

  it('adds a category', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'New category' }))

    expect(await findCategory('Untitled')).toBeInTheDocument()
    await waitFor(() => expect(db.categories.map((c) => c.name)).toContain('Untitled'))
  })

  it('adds the first category to an empty board, at the top', async () => {
    const empty = seedBoard('Empty', [])
    const { user } = renderApp(`/b/${empty.id}`)

    await user.click(await screen.findByRole('button', { name: 'New category' }))

    expect(await findCategory('Untitled')).toBeInTheDocument()
    await waitFor(() => expect(db.categories.find((c) => c.name === 'Untitled')?.y_position).toBe(0))
  })

  it('renames a category', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    const title = await screen.findByDisplayValue('Supports')
    await user.clear(title)
    await user.type(title, 'Hard Supports')

    // Saved after a short debounce.
    await waitFor(() => expect(db.categories.map((c) => c.name)).toContain('Hard Supports'))
  })

  it('deletes a category after confirming', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    await user.click(within(supports).getByTitle('Delete category'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))

    // The card goes at once, and the same poof as a hero dropped off every category plays in its place, then clears.
    expect(supports).not.toBeInTheDocument()
    expect(document.querySelector('[data-drop-poof]')).not.toBeNull()
    await waitFor(() => expect(db.categories.map((c) => c.name)).not.toContain('Supports'))
    await waitFor(() => expect(document.querySelector('[data-drop-poof]')).toBeNull(), { timeout: 2000 })
  })

  it('backs out of deleting a category on Escape and hands focus back to the trash', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    const trash = within(supports).getByTitle('Delete category')
    await user.click(trash)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus())

    await user.keyboard('[Escape]')
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument())
    expect(trash).toHaveFocus()
    expect(db.categories.map((c) => c.name)).toContain('Supports')
  })

  it('colours a category from the swatches in its header, previewing each on the way', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    expect(supports).not.toHaveAttribute('data-color')
    await user.click(within(supports).getByRole('button', { name: 'Colour' }))

    // The saved choice (none yet) takes focus.
    const swatches = within(supports).getByRole('group', { name: 'Category colour' })
    await waitFor(() => expect(within(swatches).getByRole('button', { name: 'None' })).toHaveFocus())
    expect(within(swatches).getByRole('button', { name: 'None' })).toHaveAttribute('aria-pressed', 'true')

    // Hovering a swatch shows it on the card without saving it.
    await user.hover(within(swatches).getByRole('button', { name: 'Violet' }))
    expect(supports).toHaveAttribute('data-color', 'violet')
    expect(colorOf('Supports')).toBeNull()

    await user.click(within(swatches).getByRole('button', { name: 'Amber' }))
    expect(supports).toHaveAttribute('data-color', 'amber')
    expect(within(supports).queryByRole('group')).not.toBeInTheDocument()
    expect(within(supports).getByRole('button', { name: 'Colour' })).toHaveFocus()
    await waitFor(() => expect(colorOf('Supports')).toBe('amber'))
    // A recolour is its own save: the name is left alone.
    expect(db.categories.map((c) => c.name)).toContain('Supports')
  })

  it('backs out of colouring on Escape or the X, with nothing saved', async () => {
    setColor('Supports', 'red')
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    expect(supports).toHaveAttribute('data-color', 'red')
    const trigger = within(supports).getByRole('button', { name: 'Colour' })

    await user.click(trigger)
    await user.hover(within(supports).getByRole('button', { name: 'Blue' }))
    expect(supports).toHaveAttribute('data-color', 'blue')
    await user.keyboard('[Escape]')
    expect(within(supports).queryByRole('group')).not.toBeInTheDocument()
    expect(supports).toHaveAttribute('data-color', 'red')
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    await user.click(within(supports).getByRole('button', { name: 'Cancel' }))
    expect(within(supports).queryByRole('group')).not.toBeInTheDocument()
    expect(colorOf('Supports')).toBe('red')
  })

  it('clears a category colour with None', async () => {
    setColor('Supports', 'red')
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    await user.click(within(supports).getByRole('button', { name: 'Colour' }))
    expect(within(supports).getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(within(supports).getByRole('button', { name: 'None' }))

    expect(supports).not.toHaveAttribute('data-color')
    await waitFor(() => expect(colorOf('Supports')).toBeNull())
  })

  it('adds a hero from the hero selector', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    await user.click(within(supports).getByRole('button', { name: 'Add hero' }))
    await user.click(await screen.findByTitle('Select Lion'))

    expect(heroesShownIn(supports)).toEqual(['Crystal Maiden', 'Lion'])
    await waitFor(() => expect(heroNamesIn('Supports', board.id)).toEqual(['Crystal Maiden', 'Lion']))
  })

  it('says "Add heroes" beside the plus only while a category is empty', async () => {
    const empty = seedBoard('Fresh', [{ name: 'Pocket picks', heroes: [] }])
    const { user } = renderApp(`/b/${empty.id}`)

    const pocket = await findCategory('Pocket picks')
    expect(within(pocket).getByText('Add heroes')).toBeInTheDocument()

    await user.click(within(pocket).getByRole('button', { name: 'Add hero' }))
    await user.click(await screen.findByTitle('Select Lion'))

    expect(heroesShownIn(pocket)).toEqual(['Lion'])
    expect(within(pocket).queryByText('Add heroes')).not.toBeInTheDocument()
  })

  it('shows a change before the server answers, and undoes it if the save fails', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      http.post(`${API}/categories/:id/heroes`, async () => {
        await answered
        return HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      })
    )
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    await user.click(within(supports).getByRole('button', { name: 'Add hero' }))
    await user.click(await screen.findByTitle('Select Lion'))

    // Shown right away, while the request is still pending.
    expect(heroesShownIn(supports)).toEqual(['Crystal Maiden', 'Lion'])

    release()

    // The save failed, so the board is refetched and matches the server again.
    await waitFor(() => expect(heroesShownIn(supports)).toEqual(['Crystal Maiden']))
  })

  it('keeps edits made while an earlier save is in flight', async () => {
    server.use(
      http.put(`${API}/categories/:id`, async () => {
        await delay(200)
        return undefined // fall through to the regular handler
      })
    )
    const { user } = renderApp(`/b/${board.id}`)

    const title = await screen.findByDisplayValue('Supports')
    await user.clear(title)
    await user.type(title, 'Hard Supports')
    await user.click(await screen.findByRole('button', { name: 'New category' }))

    expect(await findCategory('Untitled')).toBeInTheDocument()
    await waitFor(() => expect(db.categories.map((c) => c.name)).toEqual(['Carries', 'Hard Supports', 'Untitled']))
    expect(screen.getByDisplayValue('Hard Supports')).toBeInTheDocument()
  })

  it('sends no saves just for opening a board', async () => {
    const writes: string[] = []
    server.events.on('request:start', ({ request }) => {
      if (request.method !== 'GET') writes.push(`${request.method} ${new URL(request.url).pathname}`)
    })
    renderApp(`/b/${board.id}`)

    await findCategory('Supports')
    await new Promise((resolve) => setTimeout(resolve, 400)) // past the title's save debounce

    expect(writes).toEqual([])
    server.events.removeAllListeners()
  })

  it('shows Saving while a save is pending, then Saved', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      http.post(`${API}/boards/:id/categories`, async () => {
        await answered
        return undefined
      })
    )
    const { user } = renderApp(`/b/${board.id}`)

    expect(await screen.findByText('Saved')).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'New category' }))
    expect(await screen.findByText('Saving')).toBeInTheDocument()

    release()

    // Stays on Saving for a moment so quick saves don't flicker.
    expect(await screen.findByText('Saved', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.queryByText('Saving')).not.toBeInTheDocument()
  })

  it("offers a retry when the board can't be loaded", async () => {
    let fail = true
    server.use(http.get(`${API}/boards/:id`, () => (fail ? HttpResponse.json({}, { status: 500 }) : undefined)))
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { user } = renderApp(`/b/${board.id}`)

    // Skip past React Query's retries (3, with backoff) before it gives up.
    for (let i = 0; i < 20 && !screen.queryByRole('alert'); i++) await vi.advanceTimersByTimeAsync(500)
    vi.useRealTimers()
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load this board")

    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await findCategory('Supports')).toBeInTheDocument()
  })

  it("sends a board's saves one at a time, in order", async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      http.put(`${API}/boards/:id/favorite`, async () => {
        await answered
        return undefined
      })
    )
    const writes: string[] = []
    server.events.on('request:start', ({ request }) => {
      if (request.method !== 'GET') writes.push(`${request.method} ${new URL(request.url).pathname}`)
    })
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'Favorite board' }))
    await user.click(screen.getByRole('button', { name: 'New category' }))

    // The new category shows right away, but its save waits for the favorite's.
    expect(await findCategory('Untitled')).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(writes).toEqual([`PUT /api/boards/${board.id}/favorite`])

    release()

    await waitFor(() =>
      expect(writes).toEqual([`PUT /api/boards/${board.id}/favorite`, `POST /api/boards/${board.id}/categories`])
    )
    server.events.removeAllListeners()
  })

  it('after a failed save, keeps the changes of saves queued behind it', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      http.post(`${API}/categories/:id/heroes`, async () => {
        await answered
        return HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      })
    )
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    await user.click(within(supports).getByRole('button', { name: 'Add hero' }))
    await user.click(await screen.findByTitle('Select Lion'))
    await user.click(screen.getByRole('button', { name: 'New category' }))

    release()

    // The hero is undone; the category, saved after the failure, stays.
    await waitFor(() => expect(db.categories.map((c) => c.name)).toContain('Untitled'))
    await waitFor(() => expect(heroesShownIn(supports)).toEqual(['Crystal Maiden']))
    expect(await findCategory('Untitled')).toBeInTheDocument()
  })

  it("shows Couldn't save when a save fails", async () => {
    server.use(
      http.post(`${API}/boards/:id/categories`, () => HttpResponse.json({ message: 'Server Error' }, { status: 500 }))
    )
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByRole('button', { name: 'New category' }))

    expect(await screen.findByText("Couldn't save. Change undone.", {}, { timeout: 3000 })).toBeInTheDocument()
  })

  describe('popovers', () => {
    it('focuses the hero search when the selector opens, and closes it on Escape', async () => {
      const { user } = renderApp(`/b/${board.id}`)

      const supports = await findCategory('Supports')
      await user.click(within(supports).getByRole('button', { name: 'Add hero' }))

      await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toHaveFocus())
      await user.keyboard('[Escape]')
      await waitFor(() => expect(screen.queryByTitle('Select Lion')).not.toBeInTheDocument())
    })

    it('closes the delete confirmation on an outside click without deleting', async () => {
      const { user } = renderApp(`/b/${board.id}`)

      const supports = await findCategory('Supports')
      await user.click(within(supports).getByTitle('Delete category'))
      const cancel = await screen.findByRole('button', { name: 'Cancel' })
      await waitFor(() => expect(cancel).toHaveFocus())

      await user.click(document.body)
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument())
      expect(db.categories.map((c) => c.name)).toContain('Supports')
    })

    it('closes the board name editor with its close button, and returns focus to Rename', async () => {
      const { user } = renderApp(`/b/${board.id}`)

      const rename = await screen.findByRole('button', { name: 'Rename board' })
      await user.click(rename)
      const input = await screen.findByRole('textbox', { name: 'Board name' })
      await waitFor(() => expect(input).toHaveFocus())

      await user.click(screen.getByRole('button', { name: 'Close' }))
      await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Board name' })).not.toBeInTheDocument())
      await waitFor(() => expect(rename).toHaveFocus())
    })
  })
})
