import { describe, expect, it } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { API, server } from './support/handlers'
import { db } from './support/db'
import { currentPath, renderApp, screen } from './support/render'

const tray = () => screen.findByRole('region', { name: 'Start this board with' })

describe('new board', () => {
  it('offers Default, Tier List and Blank Slate, and saves nothing yet', async () => {
    renderApp('/b/new')

    const starts = within(await tray()).getAllByRole('button')
    expect(starts).toHaveLength(3)
    // The previews are decorative, so each button is named by its start's name and description
    expect(starts[0]).toHaveAccessibleName(/^Default/)
    expect(starts[1]).toHaveAccessibleName(/^Tier List/)
    expect(starts[2]).toHaveAccessibleName(/^Blank Slate/)
    expect(db.boards).toHaveLength(0)
  })

  it('creates the board from the chosen start and opens it in place of /b/new', async () => {
    const { user } = renderApp('/')
    await user.click(await screen.findByRole('button', { name: 'New Board' }))

    await user.click(within(await tray()).getByRole('button', { name: /Tier List/ }))

    expect(await screen.findByDisplayValue('A Tier')).toBeInTheDocument()
    expect(db.boards).toHaveLength(1)
    expect(db.categories.map((category) => category.name)).toEqual([
      'S Tier',
      'F Tier',
      'A Tier',
      'B Tier',
      'C Tier',
      'D Tier'
    ])
    expect(currentPath()).toBe(`/b/${db.boards[0].id}`)

    // Back skips /b/new: it goes where New Board was clicked.
    window.history.back()
    await waitFor(() => expect(currentPath()).toBe('/'))
  })

  it('creates nothing when left without choosing', async () => {
    const { user } = renderApp('/b/new')
    await tray()

    await user.click(screen.getByRole('link', { name: /smarf/i }))

    await waitFor(() => expect(currentPath()).toBe('/'))
    expect(db.boards).toHaveLength(0)
  })

  it('folds into "Creating Tier List" while it saves, then hands over to the dock', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      // Returns nothing, so the fake API's own handler answers once it's released
      http.post(`${API}/boards`, async () => {
        await answered
      })
    )
    const { user } = renderApp('/b/new')
    await user.click(within(await tray()).getByRole('button', { name: /Tier List/ }))

    expect(await screen.findByRole('region', { name: 'Creating Tier List' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Creating Tier List')).toBeInTheDocument()

    release()

    expect(await screen.findByDisplayValue('A Tier')).toBeInTheDocument()
    // The dock carries "Creating …" over, then swaps it for its own row (on timers: jsdom has no layout to animate).
    await waitFor(() => expect(screen.queryByText(/^Creating/)).not.toBeInTheDocument(), { timeout: 3000 })
    expect(screen.getByRole('button', { name: 'Rename board' })).toBeInTheDocument()
    // The hand-over's router state is cleared, so a refresh wouldn't replay it
    expect((window.history.state as { usr?: unknown } | null)?.usr ?? null).toBeNull()
  })

  it('brings the tray back with its error when the save fails, and lets you choose again', async () => {
    server.use(
      http.post(`${API}/boards`, () => HttpResponse.json({ message: 'Server Error' }, { status: 500 }), { once: true })
    )
    const { user } = renderApp('/b/new')
    await user.click(within(await tray()).getByRole('button', { name: /Tier List/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't create the board. Choose again.")
    expect(db.boards).toHaveLength(0)

    await user.click(within(await tray()).getByRole('button', { name: /Blank Slate/ }))

    expect(await screen.findByDisplayValue('Grief Squad')).toBeInTheDocument()
    expect(db.boards).toHaveLength(1)
  })

  it('stays where you went if you leave while it saves', async () => {
    let release!: () => void
    const answered = new Promise<void>((resolve) => (release = resolve))
    server.use(
      // Returns nothing, so the fake API's own handler answers once it's released
      http.post(`${API}/boards`, async () => {
        await answered
      })
    )
    const { user } = renderApp('/b/new')
    await user.click(within(await tray()).getByRole('button', { name: /Default/ }))
    await screen.findByRole('region', { name: 'Creating Default' })

    await user.click(screen.getByRole('link', { name: /smarf/i }))
    await waitFor(() => expect(currentPath()).toBe('/'))
    release()

    // The board is still created, and shows on Home, but nothing pulls you to it.
    expect(await screen.findByText('Untitled')).toBeInTheDocument()
    expect(currentPath()).toBe('/')
  })
})
