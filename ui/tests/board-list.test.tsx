import { describe, expect, it, vi } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { API, server } from './support/handlers'
import { db, seedBoard } from './support/db'
import { currentPath, renderApp, screen } from './support/render'

describe('board list', () => {
  it('shows favorite and recent boards in separate sections', async () => {
    seedBoard('Ranked', [], { is_favorite: true })
    seedBoard('Turbo', [])
    renderApp('/')

    const favorites = (await screen.findByText('Favorite Boards')).parentElement!
    const recent = screen.getByText('Recent Boards').parentElement!
    expect(within(favorites).getByText('Ranked')).toBeInTheDocument()
    expect(within(recent).getByText('Turbo')).toBeInTheDocument()
    expect(within(recent).queryByText('Ranked')).not.toBeInTheDocument()
  })

  it('favorites a board from the list', async () => {
    const board = seedBoard('Turbo', [])
    const { user } = renderApp('/')

    const recent = (await screen.findByText('Recent Boards')).parentElement!
    const item = within(recent).getByText('Turbo').closest('a')!.parentElement!
    await user.click(within(item).getByRole('button'))

    const favorites = (await screen.findByText('Favorite Boards')).parentElement!
    expect(within(favorites).getByText('Turbo')).toBeInTheDocument()
    expect(db.boards.find((b) => b.id === board.id)!.is_favorite).toBe(true)
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
    const { user } = renderApp('/')

    const recent = (await screen.findByText('Recent Boards')).parentElement!
    const item = within(recent).getByText('Turbo').closest('a')!.parentElement!
    await user.click(within(item).getByRole('button'))

    // Moved to favorites while the request is still pending.
    const favorites = (await screen.findByText('Favorite Boards')).parentElement!
    expect(within(favorites).getByText('Turbo')).toBeInTheDocument()

    release()

    // The save failed, so the list is refetched and matches the server again.
    await waitFor(() => expect(screen.queryByText('Favorite Boards')).not.toBeInTheDocument())
    expect(within(screen.getByText('Recent Boards').parentElement!).getByText('Turbo')).toBeInTheDocument()
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
