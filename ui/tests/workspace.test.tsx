import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { API, server } from './support/handlers'
import { db, heroNamesIn, seedBoard, type DbBoard } from './support/db'
import { currentPath, renderApp, screen } from './support/render'
import { findCategory, heroesShownIn } from './support/workspace'

let board: DbBoard

beforeEach(() => {
  board = seedBoard('Ranked', [
    { name: 'Carries', heroes: ['Anti-Mage', 'Juggernaut'] },
    { name: 'Supports', heroes: ['Crystal Maiden'] }
  ])
})

const findBoard = () => db.boards.find((b) => b.id === board.id)

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

    await user.click(await screen.findByRole('button', { name: 'Add board to favorites' }))

    expect(await screen.findByRole('button', { name: 'Remove board from favorites' })).toBeInTheDocument()
    await waitFor(() => expect(findBoard()!.is_favorite).toBe(true))
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
    expect(await screen.findByText('2 categories · 3 heroes', { exact: false })).toBeInTheDocument()

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

    await waitFor(() => expect(screen.queryByDisplayValue('Supports')).not.toBeInTheDocument())
    await waitFor(() => expect(db.categories.map((c) => c.name)).not.toContain('Supports'))
  })

  it('adds a hero from the hero selector', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    const supports = await findCategory('Supports')
    await user.click(within(supports).getByRole('button', { name: 'Add' }))
    await user.click(await screen.findByTitle('Select Lion'))

    expect(heroesShownIn(supports)).toEqual(['Crystal Maiden', 'Lion'])
    await waitFor(() => expect(heroNamesIn('Supports', board.id)).toEqual(['Crystal Maiden', 'Lion']))
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
    await user.click(within(supports).getByRole('button', { name: 'Add' }))
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

    await user.click(await screen.findByRole('button', { name: 'Add board to favorites' }))
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
    await user.click(within(supports).getByRole('button', { name: 'Add' }))
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
      await user.click(within(supports).getByRole('button', { name: 'Add' }))

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
