import { beforeEach, describe, expect, it } from 'vitest'
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
    expect(await screen.findByRole('option', { name: 'Ranked (Selected)' })).toBeInTheDocument()
  })

  it('renames the board', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('Edit board name'))
    const input = await screen.findByPlaceholderText('Ranked')
    await user.clear(input)
    await user.type(input, 'Ranked Solo{Enter}')

    await waitFor(() => expect(findBoard()!.name).toBe('Ranked Solo'))
    expect(await screen.findByRole('option', { name: 'Ranked Solo (Selected)' })).toBeInTheDocument()
  })

  it('favorites the board from the toolbar', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('Add board to favorites'))

    expect(await screen.findByTitle('Remove board from favorites')).toBeInTheDocument()
    await waitFor(() => expect(findBoard()!.is_favorite).toBe(true))
  })

  it('duplicates the board and opens the copy', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('Duplicate board'))

    await waitFor(() => expect(db.boards).toHaveLength(2))
    const copy = db.boards[1]
    await waitFor(() => expect(currentPath()).toBe(`/b/${copy.id}`))
    expect(heroesShownIn(await findCategory('Carries'))).toEqual(['Anti-Mage', 'Juggernaut'])
  })

  it('deletes the board only after its name is typed', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('Delete board'))
    const confirm = await screen.findByRole('button', { name: 'Delete' })
    expect(confirm).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Enter board name (Ranked)'), 'Ranked')
    await user.click(confirm)

    await waitFor(() => expect(currentPath()).toBe('/'))
    expect(db.boards).toHaveLength(0)
  })

  it('adds a category', async () => {
    const { user } = renderApp(`/b/${board.id}`)

    await user.click(await screen.findByTitle('New category'))

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
    await user.click(await screen.findByTitle('New category'))

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

  it('shows Updating while a save is pending, then Saved', async () => {
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
    await user.click(await screen.findByTitle('New category'))
    expect(await screen.findByText('Updating')).toBeInTheDocument()

    release()

    // Stays on Updating for a moment so quick saves don't flicker.
    expect(await screen.findByText('Saved', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.queryByText('Updating')).not.toBeInTheDocument()
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

    it('closes the board name editor with its close button', async () => {
      const { user } = renderApp(`/b/${board.id}`)

      await user.click(await screen.findByTitle('Edit board name'))
      const input = await screen.findByPlaceholderText('Ranked')
      await waitFor(() => expect(input).toHaveFocus())

      await user.click(screen.getByTitle('Close'))
      await waitFor(() => expect(screen.queryByPlaceholderText('Ranked')).not.toBeInTheDocument())
    })
  })
})
