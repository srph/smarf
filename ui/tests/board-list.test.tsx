import { describe, expect, it, vi } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { API, server } from './support/handlers'
import { db, seedBoard } from './support/db'
import { currentPath, renderApp, screen } from './support/render'

// The board names in the list, top to bottom.
const boardNames = () => screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)

// A board's row: its link and its star button.
const row = (name: string) => screen.getByRole('heading', { level: 3, name }).closest('a')!.parentElement!

describe('board list', () => {
  it('lists favorites first, the latest favorited on top, then the rest newest first', async () => {
    seedBoard('Ranked', [], { is_favorite: true, favorited_at: '2026-11-03T00:00:00.000000Z' })
    seedBoard('Turbo', [])
    seedBoard('Captains Mode', [], { is_favorite: true, favorited_at: '2026-11-02T00:00:00.000000Z' })
    seedBoard('Ability Draft', [])
    renderApp('/')

    await screen.findByText('Ranked')
    expect(boardNames()).toEqual(['Ranked', 'Captains Mode', 'Ability Draft', 'Turbo'])
  })

  it('puts a newly favorited board above the other favorites, even newer boards', async () => {
    seedBoard('Turbo', [])
    seedBoard('Ranked', [], { is_favorite: true })
    seedBoard('Captains Mode', [], { is_favorite: true })
    const { user } = renderApp('/')

    await screen.findByText('Turbo')
    expect(boardNames()).toEqual(['Captains Mode', 'Ranked', 'Turbo'])

    await user.click(within(row('Turbo')).getByTitle('Favorite board'))

    // On top right away, and still on top once the list is refetched with the server's favorited_at.
    expect(boardNames()).toEqual(['Turbo', 'Captains Mode', 'Ranked'])
    await waitFor(() => expect(db.boards[0].favorited_at).not.toBeNull())
    await waitFor(() => expect(boardNames()).toEqual(['Turbo', 'Captains Mode', 'Ranked']))
  })

  it('favorites a board from the list, moving it to the top', async () => {
    seedBoard('Ranked', [])
    const board = seedBoard('Turbo', [])
    seedBoard('Ability Draft', [])
    const { user } = renderApp('/')

    await screen.findByText('Turbo')
    expect(boardNames()).toEqual(['Ability Draft', 'Turbo', 'Ranked'])

    await user.click(within(row('Turbo')).getByTitle('Favorite board'))

    expect(within(row('Turbo')).getByTitle('Unfavorite board')).toBeInTheDocument()
    expect(boardNames()).toEqual(['Turbo', 'Ability Draft', 'Ranked'])
    await waitFor(() => expect(db.boards.find((b) => b.id === board.id)!.is_favorite).toBe(true))
  })

  it('favorites a board before the server answers, and undoes it if the save fails', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      http.put(`${API}/boards/:id/favorite`, async () => {
        await answered
        return HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      })
    )
    seedBoard('Turbo', [])
    seedBoard('Ranked', [])
    const { user } = renderApp('/')

    await screen.findByText('Turbo')
    await user.click(within(row('Turbo')).getByTitle('Favorite board'))

    // Moved to the top while the request is still pending.
    expect(boardNames()).toEqual(['Turbo', 'Ranked'])

    release()

    // The save failed, so the list is refetched and matches the server again.
    await waitFor(() => expect(boardNames()).toEqual(['Ranked', 'Turbo']))
    expect(within(row('Turbo')).getByTitle('Favorite board')).toBeInTheDocument()
  })

  it("offers a retry when the boards can't be loaded", async () => {
    let fail = true
    server.use(http.get(`${API}/boards`, () => (fail ? HttpResponse.json({}, { status: 500 }) : undefined)))
    seedBoard('Turbo', [])
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { user } = renderApp('/')

    // Skip past React Query's retries (3, with backoff) before it gives up.
    for (let i = 0; i < 20 && !screen.queryByRole('alert'); i++) await vi.advanceTimersByTimeAsync(500)
    vi.useRealTimers()
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load your boards")

    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Turbo')).toBeInTheDocument()
  })

  it('creates a board with two starter categories and opens it', async () => {
    const { user } = renderApp('/')

    const newBoard = await screen.findByRole('button', { name: 'New Board' })
    await waitFor(() => expect(newBoard).toBeEnabled()) // waits for the hero list
    await user.click(newBoard)

    expect(await screen.findByDisplayValue('Mid Farming')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Suntukan Offlane')).toBeInTheDocument()
    expect(db.boards).toHaveLength(1)
    expect(currentPath()).toBe(`/b/${db.boards[0].id}`)
  })

  it('shows a skeleton while the boards load', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      http.get(`${API}/boards`, async () => {
        await answered
      })
    )
    seedBoard('Turbo', [])
    renderApp('/')

    expect(await screen.findByRole('status')).toHaveTextContent('Loading your boards')

    release()

    expect(await screen.findByText('Turbo')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('invites a user with no boards to create one, and opens it', async () => {
    const { user } = renderApp('/')

    expect(await screen.findByText('No boards yet')).toBeInTheDocument()
    const create = screen.getByRole('button', { name: 'Create your first board' })
    await waitFor(() => expect(create).toBeEnabled()) // waits for the hero list
    await user.click(create)

    expect(await screen.findByDisplayValue('Mid Farming')).toBeInTheDocument()
    expect(db.boards).toHaveLength(1)
    expect(currentPath()).toBe(`/b/${db.boards[0].id}`)
  })

  it('disables both create buttons while a board is being created', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      http.post(`${API}/boards`, async () => {
        await answered
      })
    )
    const { user } = renderApp('/')

    const create = await screen.findByRole('button', { name: 'Create your first board' })
    await waitFor(() => expect(create).toBeEnabled())
    await user.click(create)

    expect(await screen.findByRole('button', { name: 'Creating' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'New Board' })).toBeDisabled()

    release()

    await waitFor(() => expect(currentPath()).toMatch(/^\/b\//))
  })

  it('shows Creating only on the button that was clicked', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      http.post(`${API}/boards`, async () => {
        await answered
      })
    )
    const { user } = renderApp('/')

    const newBoard = await screen.findByRole('button', { name: 'New Board' })
    await waitFor(() => expect(newBoard).toBeEnabled())
    await user.click(newBoard)

    expect(newBoard).toHaveAccessibleName('Creating')
    expect(newBoard).toHaveAttribute('aria-busy', 'true')
    const create = screen.getByRole('button', { name: 'Create your first board' })
    expect(create).toBeDisabled()
    expect(create).not.toHaveAttribute('aria-busy')

    release()

    await waitFor(() => expect(currentPath()).toMatch(/^\/b\//))
    expect(screen.getByRole('button', { name: 'New Board' })).not.toHaveAttribute('aria-busy')
  })

  it('opens a board from the list', async () => {
    seedBoard('Turbo', [{ name: 'Carries', heroes: ['Axe'] }])
    const { user } = renderApp('/')

    await user.click(await screen.findByText('Turbo'))

    expect(await screen.findByDisplayValue('Carries')).toBeInTheDocument()
  })

  it('sends unknown URLs to the board list', async () => {
    renderApp('/no-such-page')

    expect(await screen.findByRole('button', { name: 'New Board' })).toBeInTheDocument()
    expect(currentPath()).toBe('/')
  })

  it('opens a page from the account menu', async () => {
    const { user } = renderApp('/')

    await user.click(await screen.findByTitle('Account menu'))
    await user.click(await screen.findByRole('menuitem', { name: 'Account Settings' }))

    await waitFor(() => expect(currentPath()).toBe('/account'))
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })
})
